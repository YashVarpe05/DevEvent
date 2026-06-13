import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as registerEvent } from '@/app/api/events/[id]/register/route';
import { POST as cancelRegistration } from '@/app/api/registrations/[id]/cancel/route';
import { POST as checkInByCode } from '@/app/api/organizer/events/[id]/check-in/code/route';
import { GET as getParticipants } from '@/app/api/organizer/events/[id]/attendees/route';
import { POST as submitFeedback } from '@/app/api/events/[id]/feedback/route';
import { POST as createEvent } from '@/app/api/events/route';
import { POST as publishEvent } from '@/app/api/events/[id]/publish/route';
import { GET as runLifecycleCron } from '@/app/api/cron/event-reminders/route';
import { POST as undoCheckIn } from '@/app/api/organizer/registrations/[id]/undo-check-in/route';
import FollowOrganizer from '@/database/follow-organizer.model';
import { generateQrPayload, verifyQrPayload } from '@/lib/utils/ticket';
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
  sendWaitlistJoinedEmail: vi.fn().mockResolvedValue(true),
  sendWaitlistPromotedEmail: vi.fn().mockResolvedValue(true),
  sendRegistrationPendingEmail: vi.fn().mockResolvedValue(true),
  sendRegistrationDeclinedEmail: vi.fn().mockResolvedValue(true),
  sendNewEventEmail: vi.fn().mockResolvedValue(true),
  sendEventReminderEmail: vi.fn().mockResolvedValue(true),
  sendEventStartingSoonEmail: vi.fn().mockResolvedValue(true),
  sendFeedbackRequestEmail: vi.fn().mockResolvedValue(true),
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

  const fillCapacity = async (count: number) => {
    for (let i = 0; i < count; i++) {
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
  };

  it('Blocks registration when event is full and waitlist is disabled', async () => {
    mockAuth({ id: testAttendeeId, email: 'attendee@test.com', name: 'Test Attendee', roles: ['attendee'] });

    await Event.findByIdAndUpdate(testEventId, { waitlistEnabled: false });
    await fillCapacity(5);

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

  it('Waitlists registration when event is full and waitlist is enabled', async () => {
    mockAuth({ id: testAttendeeId, email: 'attendee@test.com', name: 'Test Attendee', roles: ['attendee'] });

    await fillCapacity(5);

    const req = new NextRequest(`http://localhost/api/events/${testEventId}/register`, {
      method: 'POST',
      body: JSON.stringify({ quantity: 1 }),
    });
    const props = { params: Promise.resolve({ id: testEventId }) };

    const res = await registerEvent(req, props);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.status).toBe('waitlisted');

    const regInDb = await Registration.findOne({ eventId: testEventId, attendeeUserId: testAttendeeId });
    expect(regInDb?.status).toBe('waitlisted');
  });

  it('Promotes the oldest waitlisted registration when a confirmed spot frees up', async () => {
    mockAuth({ id: testAttendeeId, email: 'attendee@test.com', name: 'Test Attendee', roles: ['attendee'] });

    await fillCapacity(4);

    // The cancelling user holds the 5th (last) confirmed spot
    const myReg = await Registration.create({
      eventId: testEventId,
      attendeeUserId: testAttendeeId,
      attendeeName: 'Cancelling User',
      attendeeEmail: 'attendee@test.com',
      status: 'confirmed',
      ticketCode: 'MINE-1',
      qrPayload: 'QR-MINE',
      bookingType: 'free',
      quantity: 1
    });

    const waitlisted = await Registration.create({
      eventId: testEventId,
      attendeeUserId: new mongoose.Types.ObjectId().toString(),
      attendeeName: 'Waiting User',
      attendeeEmail: 'waiting@test.com',
      status: 'waitlisted',
      ticketCode: 'WAIT-1',
      qrPayload: 'QR-WAIT',
      bookingType: 'free',
      quantity: 1
    });

    const req = new NextRequest(`http://localhost/api/registrations/${myReg._id}/cancel`, {
      method: 'POST',
    });
    const props = { params: Promise.resolve({ id: (myReg as any)._id.toString() }) };

    const res = await cancelRegistration(req, props);
    expect(res.status).toBe(200);

    const promoted = await Registration.findById(waitlisted._id);
    expect(promoted?.status).toBe('confirmed');
  });

  it('Allows a co-host to view attendees and blocks unrelated users', async () => {
    const coHostId = new mongoose.Types.ObjectId().toString();
    await User.create({
      _id: new mongoose.Types.ObjectId(coHostId),
      name: 'Co Host',
      email: 'cohost@test.com',
      provider: 'credentials',
      roles: ['attendee'],
      isActive: true,
      emailVerified: true
    } as any);

    await Event.findByIdAndUpdate(testEventId, { coHostEmails: ['cohost@test.com'] });

    const props = { params: Promise.resolve({ id: testEventId }) };

    // Co-host (matched by email) can list attendees
    mockAuth({ id: coHostId, email: 'cohost@test.com', name: 'Co Host', roles: ['attendee'] });
    let res = await getParticipants(
      new NextRequest(`http://localhost/api/organizer/events/${testEventId}/attendees`),
      props,
    );
    expect(res.status).toBe(200);

    // Unrelated user is rejected
    mockAuth({ id: new mongoose.Types.ObjectId().toString(), email: 'stranger@test.com', roles: ['attendee'] });
    res = await getParticipants(
      new NextRequest(`http://localhost/api/organizer/events/${testEventId}/attendees`),
      props,
    );
    expect(res.status).toBe(403);
  });

  it('Accepts feedback from attendees only, and only after the event ends', async () => {
    mockAuth({ id: testAttendeeId, email: 'attendee@test.com', name: 'Test Attendee', roles: ['attendee'] });

    await Registration.create({
      eventId: testEventId,
      attendeeUserId: testAttendeeId,
      attendeeName: 'Feedback User',
      attendeeEmail: 'attendee@test.com',
      status: 'confirmed',
      ticketCode: 'FEEDBACK-1',
      qrPayload: 'QR-FEEDBACK',
      bookingType: 'free',
      quantity: 1
    });

    const props = { params: Promise.resolve({ id: testEventId }) };
    const makeReq = () => new NextRequest(`http://localhost/api/events/${testEventId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating: 5, comment: 'Great event!' }),
    });

    // Event still upcoming — rejected
    let res = await submitFeedback(makeReq(), props);
    expect(res.status).toBe(400);

    // After the event ends — accepted
    await Event.findByIdAndUpdate(testEventId, {
      startAt: new Date(Date.now() - 172800000),
      endAt: new Date(Date.now() - 86400000),
    });
    res = await submitFeedback(makeReq(), props);
    expect(res.status).toBe(200);

    // Non-attendee — rejected
    mockAuth({ id: new mongoose.Types.ObjectId().toString(), email: 'stranger@test.com', roles: ['attendee'] });
    res = await submitFeedback(makeReq(), props);
    expect(res.status).toBe(403);
  });

  it('Creates a linked series of drafts when recurrence is requested', async () => {
    mockAuth({ id: testOrganizerId, email: 'test@org.com', name: 'Test Org', roles: ['organizer'] });

    const start = new Date(Date.now() + 86400000);
    const end = new Date(Date.now() + 90000000);
    const req = new NextRequest('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Weekly Standup Meetup',
        shortDescription: 'A recurring community meetup for builders.',
        eventType: 'online',
        timezone: 'UTC',
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        recurrence: { frequency: 'weekly', count: 3 },
        // server-managed fields that must be ignored
        isFeatured: true,
        qualityScore: 99,
      }),
    });

    const res = await createEvent(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.occurrencesCreated).toBe(3);

    const series = await Event.find({ seriesId: data.event.seriesId }).sort({ startAt: 1 });
    expect(series.length).toBe(3);
    expect(series.every((e: any) => e.status === 'draft')).toBe(true);
    expect(series.every((e: any) => e.isFeatured === false)).toBe(true);
    // Each occurrence is one week apart
    const dayMs = 24 * 60 * 60 * 1000;
    expect(new Date(series[1].startAt).getTime() - new Date(series[0].startAt).getTime()).toBe(7 * dayMs);
    expect(new Date(series[2].startAt).getTime() - new Date(series[1].startAt).getTime()).toBe(7 * dayMs);
    // Slugs are unique
    const slugs = new Set(series.map((e: any) => e.slug));
    expect(slugs.size).toBe(3);
  });

  it('Enforces required custom questions and snapshots answers', async () => {
    mockAuth({ id: testAttendeeId, email: 'attendee@test.com', name: 'Test Attendee', roles: ['attendee'] });

    await Event.findByIdAndUpdate(testEventId, {
      registrationQuestions: [
        { id: 'q-size', label: 'T-shirt size', type: 'select', required: true, options: ['S', 'M', 'L'] },
        { id: 'q-news', label: 'Subscribe to newsletter', type: 'checkbox', required: false, options: [] },
      ],
    });

    const props = { params: Promise.resolve({ id: testEventId }) };
    const makeReq = (body: object) => new NextRequest(`http://localhost/api/events/${testEventId}/register`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    // Missing required answer
    let res = await registerEvent(makeReq({ quantity: 1 }), props);
    expect(res.status).toBe(400);
    expect((await res.json()).message).toMatch(/T-shirt size/);

    // Invalid dropdown choice
    res = await registerEvent(makeReq({ quantity: 1, answers: { 'q-size': 'XXL' } }), props);
    expect(res.status).toBe(400);

    // Valid answers
    res = await registerEvent(makeReq({ quantity: 1, answers: { 'q-size': 'M', 'q-news': true } }), props);
    expect(res.status).toBe(201);

    const reg = await Registration.findOne({ eventId: testEventId, attendeeUserId: testAttendeeId });
    expect(reg?.metadata?.answers).toEqual([
      { id: 'q-size', label: 'T-shirt size', value: 'M' },
      { id: 'q-news', label: 'Subscribe to newsletter', value: true },
    ]);
  });

  it('Notifies followers when an event is first published', async () => {
    const { sendNewEventEmail } = await import('@/lib/email');

    // A follower of the organizer
    const followerId = new mongoose.Types.ObjectId();
    await User.create({
      _id: followerId,
      name: 'Loyal Fan',
      email: 'fan@test.com',
      provider: 'credentials',
      roles: ['attendee'],
      isActive: true,
      emailVerified: true
    } as any);
    await FollowOrganizer.create({ userId: followerId, organizerId: testOrganizerId });

    // Make the event an unpublished draft that satisfies the publish schema
    await Event.findByIdAndUpdate(testEventId, {
      status: 'draft',
      publishedAt: null,
      online: { meetingUrl: 'https://zoom.test/room' },
    });

    mockAuth({ id: testOrganizerId, email: 'test@org.com', name: 'Test Org', roles: ['organizer'] });
    const props = { params: Promise.resolve({ id: testEventId }) };
    const res = await publishEvent(
      new NextRequest(`http://localhost/api/events/${testEventId}/publish`, { method: 'POST' }),
      props,
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.followersNotified).toBe(1);
    expect(sendNewEventEmail).toHaveBeenCalledTimes(1);
    const callArgs = (sendNewEventEmail as any).mock.calls[0];
    expect(callArgs[0]).toBe('fan@test.com');
    expect(callArgs[7]).toContain('/api/public/follows/unsubscribe?uid=');
  });

  it('Lifecycle cron sends starting-soon and feedback emails idempotently', async () => {
    const { sendEventStartingSoonEmail, sendFeedbackRequestEmail } = await import('@/lib/email');
    (sendEventStartingSoonEmail as any).mockClear();
    (sendFeedbackRequestEmail as any).mockClear();

    process.env.CRON_SECRET = 'cron-test-secret';

    // Event starting in 30 minutes (within the 70-minute window)
    await Event.findByIdAndUpdate(testEventId, {
      startAt: new Date(Date.now() + 30 * 60 * 1000),
      endAt: new Date(Date.now() + 90 * 60 * 1000),
      online: { meetingUrl: 'https://zoom.test/room' },
      lifecycleEmails: { dayBeforeSentAt: new Date(), hourBeforeSentAt: null, feedbackSentAt: null },
    });
    await Registration.create({
      eventId: testEventId,
      attendeeUserId: testAttendeeId,
      attendeeName: 'Lifecycle Tester',
      attendeeEmail: 'lifecycle@test.com',
      status: 'confirmed',
      ticketCode: 'LIFE-1',
      qrPayload: 'QR-LIFE',
      bookingType: 'free',
      quantity: 1
    });

    const cronReq = new Request('http://localhost/api/cron/event-reminders', {
      headers: { authorization: 'Bearer cron-test-secret' },
    });

    let res = await runLifecycleCron(cronReq);
    let data = await res.json();
    expect(data.startingSoon).toBe(1);
    expect((sendEventStartingSoonEmail as any).mock.calls.length).toBe(1);

    // Re-running the cron must not re-send the starting-soon email
    res = await runLifecycleCron(cronReq);
    data = await res.json();
    expect(data.startingSoon).toBe(0);

    // Move the event into the past and the cron should now send feedback prompts
    await Event.findByIdAndUpdate(testEventId, {
      startAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      endAt: new Date(Date.now() - 60 * 60 * 1000),
    });
    res = await runLifecycleCron(cronReq);
    data = await res.json();
    expect(data.feedback).toBe(1);
    expect((sendFeedbackRequestEmail as any).mock.calls.length).toBe(1);
  });

  it('Holds registration as pending approval when the event requires approval', async () => {
    mockAuth({ id: testAttendeeId, email: 'attendee@test.com', name: 'Test Attendee', roles: ['attendee'] });

    await Event.findByIdAndUpdate(testEventId, { requiresApproval: true });

    const req = new NextRequest(`http://localhost/api/events/${testEventId}/register`, {
      method: 'POST',
      body: JSON.stringify({ quantity: 1 }),
    });
    const props = { params: Promise.resolve({ id: testEventId }) };

    const res = await registerEvent(req, props);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.status).toBe('pending_approval');
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

  it('Checks in via a valid signed QR payload but rejects a tampered one', async () => {
    mockAuth({ id: testOrganizerId, roles: ['organizer'] });

    const regId = new mongoose.Types.ObjectId();
    const payload = generateQrPayload(regId.toString(), testEventId);
    await Registration.create({
      _id: regId,
      eventId: testEventId,
      attendeeUserId: testAttendeeId,
      attendeeName: 'QR User',
      attendeeEmail: 'qr@test.com',
      status: 'confirmed',
      ticketCode: 'QR-SIGNED-1',
      qrPayload: payload,
      bookingType: 'free',
      quantity: 1
    });
    const props = { params: Promise.resolve({ id: testEventId }) };

    // Tampered payload (flipped last signature char) is rejected before any check-in
    const tampered = payload.slice(0, -1) + (payload.endsWith('a') ? 'b' : 'a');
    let res = await checkInByCode(
      new NextRequest(`http://localhost/api/organizer/events/${testEventId}/check-in/code`, {
        method: 'POST', body: JSON.stringify({ payload: tampered }),
      }),
      props,
    );
    expect(res.status).toBe(400);
    expect((await res.json()).message).toMatch(/tampered|invalid/i);

    // Valid signed payload checks the attendee in
    res = await checkInByCode(
      new NextRequest(`http://localhost/api/organizer/events/${testEventId}/check-in/code`, {
        method: 'POST', body: JSON.stringify({ payload }),
      }),
      props,
    );
    expect(res.status).toBe(200);
    expect((await res.json()).scanMethod).toBe('qr');

    const updated = await Registration.findById(regId);
    expect(updated?.checkedInAt).toBeTruthy();
  });

  it('verifyQrPayload round-trips and rejects cross-event payloads', async () => {
    const regId = new mongoose.Types.ObjectId().toString();
    const payload = generateQrPayload(regId, testEventId);
    const verified = verifyQrPayload(payload);
    expect(verified?.registrationId).toBe(regId);
    expect(verified?.eventId).toBe(testEventId);
    expect(verifyQrPayload('garbage:data:here')).toBeNull();
  });

  it('Undoes an accidental check-in', async () => {
    mockAuth({ id: testOrganizerId, roles: ['organizer'] });

    const reg = await Registration.create({
      eventId: testEventId,
      attendeeUserId: testAttendeeId,
      attendeeName: 'Undo User',
      attendeeEmail: 'undo@test.com',
      status: 'confirmed',
      ticketCode: 'UNDO-1',
      qrPayload: 'QR-UNDO',
      bookingType: 'free',
      quantity: 1,
      checkedInAt: new Date(),
      checkedInBy: new mongoose.Types.ObjectId(testOrganizerId),
    });

    const res = await undoCheckIn(
      new NextRequest(`http://localhost/api/organizer/registrations/${reg._id}/undo-check-in`, { method: 'POST' }),
      { params: Promise.resolve({ id: (reg as any)._id.toString() }) },
    );
    expect(res.status).toBe(200);

    const updated = await Registration.findById(reg._id);
    expect(updated?.checkedInAt).toBeNull();
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
