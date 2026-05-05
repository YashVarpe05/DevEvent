import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as registerEvent } from '@/app/api/events/[id]/register/route';
import { POST as cancelRegistration } from '@/app/api/registrations/[id]/cancel/route';
import { POST as checkInByCode } from '@/app/api/organizer/events/[id]/check-in/code/route';
import { GET as getParticipants } from '@/app/api/organizer/events/[id]/attendees/route';
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import Event from '@/database/event.model';
import Registration from "@/database/registration.model";
import OrganizerProfile from "@/database/organizer-profile.model";
import User from "@/database/user.model";
import mongoose from 'mongoose';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/email', () => ({
  sendRegistrationEmail: vi.fn().mockResolvedValue(true),
  sendCancellationEmail: vi.fn().mockResolvedValue(true),
}));

describe('Registration Integration Tests', () => {
  let testEventId: string;
  let testAttendeeId = '507f1f77bcf86cd799439020';
  let testOrganizerId = '507f1f77bcf86cd799439021';

  beforeEach(async () => {
    vi.clearAllMocks();
    await Event.deleteMany({});
    await Registration.deleteMany({});
    await OrganizerProfile.deleteMany({});
    await User.deleteMany({});

    // Create a real attendee user
    const user = await User.create({
      _id: new mongoose.Types.ObjectId(testAttendeeId),
      name: 'Test Attendee',
      email: 'attendee@test.com',
      provider: 'credentials',
      roles: ['attendee'],
      isActive: true,
      emailVerified: true
    } as any);

    // Create organizer profile
    const profile = await OrganizerProfile.create({
      userId: testOrganizerId,
      name: 'Test Org',
      slug: 'test-org-' + Date.now(),
      email: 'test@org.com',
      displayName: 'Test Org',
      contactEmail: 'test@org.com',
      location: { country: 'US', city: 'NY' },
    } as any);

    // Create a published free event
    const event = await Event.create({
      title: 'Integration Test Event',
      shortDescription: 'Test Description for Registration',
      organizerId: testOrganizerId,
      organizerProfileId: (profile as any)._id,
      eventType: 'online',
      visibility: 'public',
      status: 'published',
      timezone: 'UTC',
      startAt: new Date(Date.now() + 86400000),
      endAt: new Date(Date.now() + 172800000),
      isPaid: false,
      capacityType: 'limited',
      capacity: 5,
      meetingUrl: 'https://zoom.test',
      categoryId: new mongoose.Types.ObjectId()
    } as any);
    testEventId = (event as any)._id.toString();
  });

  const mockAuth = (user: any) => {
    (auth as any).mockResolvedValue({ user });
  };

  it('Successfully register for a free event', async () => {
    mockAuth({ id: testAttendeeId, email: 'attendee@test.com', name: 'Test Attendee', roles: ['attendee'] });
    
    const req = new NextRequest(`http://localhost/api/events/${testEventId}/register`, {
      method: 'POST',
      body: JSON.stringify({ quantity: 1, phone: '1234567890' }),
    });
    const props = { params: Promise.resolve({ id: testEventId }) };
    
    const res = await registerEvent(req, props);
    expect(res.status).toBe(201);
    
    const data = await res.json();
    expect(data.registration.ticketCode).toBeDefined();
    expect(data.registration.status).toBe('confirmed');

    const regInDb = await Registration.findOne({ eventId: testEventId, attendeeUserId: testAttendeeId });
    expect(regInDb).toBeDefined();
    expect(regInDb?.ticketCode).toBe(data.registration.ticketCode);
  });

  it('Blocks duplicate registration for the same user', async () => {
    mockAuth({ id: testAttendeeId, email: 'attendee@test.com', name: 'Test Attendee', roles: ['attendee'] });
    
    // First registration
    await Registration.create({
      eventId: testEventId,
      attendeeUserId: testAttendeeId,
      attendeeName: 'Duplicate User',
      attendeeEmail: 'duplicate@test.com',
      status: 'confirmed',
      ticketCode: 'OLD-DE-123',
      qrPayload: 'OLD-QR-PAYLOAD',
      bookingType: 'free',
      quantity: 1
    });

    const req = new NextRequest(`http://localhost/api/events/${testEventId}/register`, {
      method: 'POST',
      body: JSON.stringify({ quantity: 1 }),
    });
    const props = { params: Promise.resolve({ id: testEventId }) };
    
    const res = await registerEvent(req, props);
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.message).toMatch(/already registered/i);
  });

  it('Blocks registration when event is full', async () => {
    mockAuth({ id: testAttendeeId, email: 'attendee@test.com', name: 'Test Attendee', roles: ['attendee'] });
    
    // Fill capacity
    for (let i = 0; i < 5; i++) {
        await Registration.create({
            eventId: testEventId,
            attendeeUserId: new mongoose.Types.ObjectId().toString(),
            attendeeName: `User ${i}`,
            attendeeEmail: `user${i}@test.com`,
            status: 'confirmed',
            ticketCode: `FULL-${i}`,
            qrPayload: `QR-${i}`,
            bookingType: 'free',
            quantity: 1
        });
    }

    const req = new NextRequest(`http://localhost/api/events/${testEventId}/register`, {
      method: 'POST',
      body: JSON.stringify({ quantity: 1 }),
    });
    const props = { params: Promise.resolve({ id: testEventId }) };
    
    const res = await registerEvent(req, props);
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.message).toMatch(/sold out/i);
  });

  it('Successfully cancel a registration', async () => {
    mockAuth({ id: testAttendeeId, email: 'attendee@test.com', name: 'Test Attendee', roles: ['attendee'] });
    
    const reg = await Registration.create({
      eventId: testEventId,
      attendeeUserId: testAttendeeId,
      attendeeName: 'Cancel User',
      attendeeEmail: 'cancel@test.com',
      status: 'confirmed',
      ticketCode: 'CANCEL-ME',
      qrPayload: 'QR-CANCEL',
      bookingType: 'free',
      quantity: 1
    });

    const req = new NextRequest(`http://localhost/api/registrations/${reg._id}/cancel`, {
      method: 'POST',
    });
    const props = { params: Promise.resolve({ id: (reg as any)._id.toString() }) };
    
    const res = await cancelRegistration(req, props);
    expect(res.status).toBe(200);

    const updatedReg = await Registration.findById(reg._id);
    expect(updatedReg?.status).toBe('cancelled_by_user');
  });

  it('Organizer can check-in an attendee by code', async () => {
    mockAuth({ id: testOrganizerId, roles: ['organizer'] });
    
    const reg = await Registration.create({
      eventId: testEventId,
      attendeeUserId: testAttendeeId,
      attendeeName: 'Checkin User',
      attendeeEmail: 'checkin@test.com',
      status: 'confirmed',
      ticketCode: 'CODE-123',
      qrPayload: 'QR-CODE',
      bookingType: 'free',
      quantity: 1
    });

    const req = new NextRequest(`http://localhost/api/organizer/events/${testEventId}/check-in/code`, {
      method: 'POST',
      body: JSON.stringify({ ticketCode: 'CODE-123' }),
    });
    const props = { params: Promise.resolve({ id: testEventId }) };
    
    const res = await checkInByCode(req, props);
    expect(res.status).toBe(200);
    
    const updatedReg = await Registration.findById(reg._id);
    expect(updatedReg?.checkedInAt).toBeDefined();
  });

  it('Blocks check-in for registration from different event', async () => {
    mockAuth({ id: testOrganizerId, roles: ['organizer'] });
    
    const otherEventId = new mongoose.Types.ObjectId().toString();
    const reg = await Registration.create({
      eventId: otherEventId,
      attendeeUserId: testAttendeeId,
      attendeeName: 'Wrong Event User',
      attendeeEmail: 'wrong@test.com',
      status: 'confirmed',
      ticketCode: 'WRONG-EVENT',
      qrPayload: 'QR-WRONG',
      bookingType: 'free',
      quantity: 1
    });

    const req = new NextRequest(`http://localhost/api/organizer/events/${testEventId}/check-in/code`, {
      method: 'POST',
      body: JSON.stringify({ ticketCode: 'WRONG-EVENT' }),
    });
    const props = { params: Promise.resolve({ id: testEventId }) };
    
    const res = await checkInByCode(req, props);
    expect(res.status).toBe(404); // Should fail as code doesn't belong to this event
  });
});
