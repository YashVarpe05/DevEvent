import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as createEvent } from '@/app/api/events/route';
import { POST as publishEvent } from '@/app/api/events/[id]/publish/route';
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import Event from '@/database/event.model';
import OrganizerProfile from '@/database/organizer-profile.model';
import { Types } from 'mongoose';

type MockUser = {
  id: string;
  roles: string[];
};

type MockAuth = () => Promise<{ user: MockUser } | null>;

type ValidationIssue = {
  path: Array<string | number>;
};

describe('Event Integration Tests', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  const mockAuth = (user: MockUser) => {
    const mockedAuth = vi.mocked(auth as unknown as MockAuth);
    mockedAuth.mockResolvedValue({ user });
  };

  it('Attendee cannot create events', async () => {
    mockAuth({ id: '507f1f77bcf86cd799439011', roles: ['attendee'] });
    const req = new NextRequest('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await createEvent(req);
    expect(res.status).toBe(403);
  });

  it('Organizer without profile cannot create events', async () => {
    mockAuth({ id: '507f1f77bcf86cd799439012', roles: ['organizer'] });
    const req = new NextRequest('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await createEvent(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toMatch(/profile not found/i);
  });

  it('Organizer with profile can create event draft', async () => {
    mockAuth({ id: '507f1f77bcf86cd799439013', roles: ['organizer'] });
    await OrganizerProfile.create({
      userId: new Types.ObjectId('507f1f77bcf86cd799439013'),
      slug: 'test-org',
      displayName: 'Test Org',
      contactEmail: 'test@org.com',
      location: { country: 'US', city: 'NY' },
      organizationType: 'community',
    });

    const req = new NextRequest('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Draft Event',
        shortDescription: 'Desc',
        timezone: 'UTC',
        startAt: new Date(Date.now() + 86400000).toISOString(),
        endAt: new Date(Date.now() + 172800000).toISOString(),
      }),
    });
    const res = await createEvent(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.event.title).toBe('Draft Event');
    expect(data.event.status).toBe('draft');
  });

  it('Publish requirement checklist enforces rules (missing location for offline event)', async () => {
    mockAuth({ id: '507f1f77bcf86cd799439014', roles: ['organizer'] });
    const profile = await OrganizerProfile.create({
      userId: new Types.ObjectId('507f1f77bcf86cd799439014'),
      slug: 'test-org2',
      displayName: 'Test Org',
      contactEmail: 'test@org.com',
      location: { country: 'US', city: 'NY' },
      organizationType: 'community',
    });

    const event = await Event.create({
      title: 'Incomplete Event',
      shortDescription: 'Desc',
      organizerId: new Types.ObjectId('507f1f77bcf86cd799439014'),
      organizerProfileId: profile._id,
      eventType: 'offline', // Requires location
      visibility: 'public',
      status: 'draft',
      timezone: 'UTC',
      startAt: new Date(Date.now() + 86400000),
      endAt: new Date(Date.now() + 172800000),
    });

    const req = new NextRequest(`http://localhost/api/events/${event._id}/publish`, {
      method: 'POST',
    });
    
    const props = { params: Promise.resolve({ id: event._id.toString() }) };
    const res = await publishEvent(req, props);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.errors).toBeDefined();
    const hasLocationError = data.errors.some((issue: ValidationIssue) => issue.path.join('.').includes('location'));
    expect(hasLocationError).toBe(true);
  });

  it('Cannot publish another organizers event', async () => {
    mockAuth({ id: '507f1f77bcf86cd799439015', roles: ['organizer'] });
    const profile = await OrganizerProfile.create({
      userId: new Types.ObjectId('507f1f77bcf86cd799439016'),
      slug: 'test-org3',
      displayName: 'Test Org',
      contactEmail: 'test@org.com',
      location: { country: 'US', city: 'NY' },
      organizationType: 'community',
    });

    const event = await Event.create({
      title: 'Valid Event',
      shortDescription: 'Desc',
      organizerId: new Types.ObjectId('507f1f77bcf86cd799439016'), // belongs to different org
      organizerProfileId: profile._id,
      eventType: 'online', 
      visibility: 'public',
      status: 'draft',
      timezone: 'UTC',
      startAt: new Date(Date.now() + 86400000),
      endAt: new Date(Date.now() + 172800000),
      online: { meetingUrl: 'https://zoom.us/test' },
      category: 'technology',
    });

    const req = new NextRequest(`http://localhost/api/events/${event._id}/publish`, {
      method: 'POST',
    });
    
    const props = { params: Promise.resolve({ id: event._id.toString() }) };
    const res = await publishEvent(req, props);
    expect(res.status).toBe(403);
  });
});
