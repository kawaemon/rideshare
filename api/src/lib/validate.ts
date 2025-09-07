import { z } from "zod";

export const DestinationSchema = z.enum(["shonandai", "tsujido"]);
export type Destination = z.infer<typeof DestinationSchema>;

export const FromSpotSchema = z.enum(["g_parking", "delta_back", "main_cross"]);
export type FromSpot = z.infer<typeof FromSpotSchema>;

export const UserIdSchema = z.string().regex(/^[a-z0-9-]{1,32}$/);

export const IsoDateTimeSchema = z.string().refine(
  (v) => {
    const d = new Date(v);
    return !Number.isNaN(d.getTime()) && v.includes("T");
  },
  { message: "invalid_datetime" },
);

export const YmdSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const CreateRideSchema = z.object({
  destination: DestinationSchema,
  fromSpot: FromSpotSchema,
  departsAt: IsoDateTimeSchema,
  capacity: z.number().int().min(1),
  note: z.string().max(200).optional(),
});
export type CreateRideInput = z.infer<typeof CreateRideSchema>;

export const ListRidesQuerySchema = z.object({
  destination: DestinationSchema.optional(),
  fromSpot: FromSpotSchema.optional(),
  date: YmdSchema.optional(),
});

export const RideIdParamSchema = z.coerce.number().int().positive();
export const RoleSchema = z.enum(["driver", "member", "all"]).default("all");
