import { z } from 'zod';
import { getUpcomingEvents, createEventRecord, getAllEvents } from './event.service.js';
import { sendSuccess, sendCreated, sendError } from '../../utils/response.js';

const createEventSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().optional(),
    date: z.string().transform((str) => new Date(str)),
    banner: z.string().url().optional(),
    startdate: z.string().transform((str) => new Date(str)),
    enddate: z.string().transform((str) => new Date(str)),
    location: z.string().max(100).optional(),
    type: z.string().max(50).optional()
});

export const getUpcoming = async (req, res) => {
    try {
        const events = await getUpcomingEvents(3);
        return sendSuccess(res, events);
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to fetch upcoming events', 500);
    }
};

export const createEvent = async (req, res) => {
    try {
        const validated = createEventSchema.parse(req.body);
        const event = await createEventRecord(validated);
        return sendCreated(res, event, 'Event created successfully');
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        console.error(error);
        return sendError(res, 'Failed to create event', 500);
    }
};

export const getEvents = async (req, res) => {
    try {
        const events = await getAllEvents();
        return sendSuccess(res, events);
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to fetch events', 500);
    }
};
