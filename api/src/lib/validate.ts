import { z } from "zod";

const StationSchema = z.enum(["shonandai", "tsujido"]);
type Station = z.infer<typeof StationSchema>;

const CampusSpotSchema = z.enum(["g_parking", "delta_back", "main_cross"]);
type CampusSpot = z.infer<typeof CampusSpotSchema>;

export const DestinationSchema = z.union([StationSchema, CampusSpotSchema]);
export type Destination = z.infer<typeof DestinationSchema>;

export const FromSpotSchema = z.union([CampusSpotSchema, StationSchema]);
export type FromSpot = z.infer<typeof FromSpotSchema>;

const isStation = (value: Destination | FromSpot): value is Station =>
  StationSchema.safeParse(value).success;

export const UserIdSchema = z.string().regex(/^[a-z0-9-]{1,32}$/);

export const IsoDateTimeSchema = z.string().refine(
  (v) => {
    const d = new Date(v);
    return !Number.isNaN(d.getTime()) && v.includes("T");
  },
  { message: "invalid_datetime" },
);

export const RideModeSchema = z.enum(["car", "taxi"]);
export type RideMode = z.infer<typeof RideModeSchema>;

const noteSchema = z.string().max(200).optional();

function ensureRouteIsValid(
  value: { destination: Destination; fromSpot: FromSpot },
  ctx: z.RefinementCtx,
) {
  const destinationIsStation = isStation(value.destination);
  const fromIsStation = isStation(value.fromSpot);

  if (destinationIsStation === fromIsStation) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "invalid_route",
      path: ["destination"],
    });
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "invalid_route", path: ["fromSpot"] });
  }
}

const baseRideFields = {
  destination: DestinationSchema,
  fromSpot: FromSpotSchema,
  departsAt: IsoDateTimeSchema,
  capacity: z.number().int().min(1),
  note: noteSchema,
};

const CreateCarRideSchema = z
  .object({
    mode: z.literal("car"),
    ...baseRideFields,
  })
  .superRefine((value, ctx) => {
    ensureRouteIsValid(value, ctx);
  });

const CreateTaxiRideSchema = z
  .object({
    mode: z.literal("taxi"),
    ...baseRideFields,
    minParticipants: z.number().int().min(2),
  })
  .superRefine((value, ctx) => {
    ensureRouteIsValid(value, ctx);
    if (value.minParticipants > value.capacity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "min_over_capacity",
        path: ["minParticipants"],
      });
    }
  });

export const CreateRideSchema = z.discriminatedUnion("mode", [CreateCarRideSchema, CreateTaxiRideSchema]);
export type CreateRideInput = z.infer<typeof CreateRideSchema>;

export const RideIdParamSchema = z.coerce.number().int().positive();
export const RoleSchema = z.enum(["driver", "member", "all"]).default("all");
export type Role = z.infer<typeof RoleSchema>;
