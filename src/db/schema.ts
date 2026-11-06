import { ROLES } from "@/lib/auth/roles";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ROLES);

/**
 * pending: importado del portal, aún no confirmado por la persona.
 * confirmed: la persona entró con Google y aceptó aparecer en squads y propuestas.
 */
export const personStatus = pgEnum("person_status", ["pending", "confirmed"]);

export const people = pgTable(
  "people",
  {
    id: serial("id").primaryKey(),
    externalKey: text("external_key").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    country: text("country"),
    area: text("area"),
    position: text("position"),
    role: text("role"),
    city: text("city"),
    linkedin: text("linkedin"),
    status: personStatus("status").notNull().default("pending"),
    /** Revisar a mano: otra persona con mismo nombre y apellido. */
    needsReview: boolean("needs_review").notNull().default(false),
    importedAt: timestamp("imported_at", { withTimezone: true }).notNull().defaultNow(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("people_external_key_idx").on(t.externalKey)],
);

export const skills = pgTable(
  "skills",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
  },
  (t) => [uniqueIndex("skills_name_idx").on(t.name)],
);

/** Relación persona-skill. level es 0 a 4; null mientras no fue declarado. */
export const personSkills = pgTable(
  "person_skills",
  {
    personId: integer("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    skillId: integer("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    level: integer("level"),
  },
  (t) => [primaryKey({ columns: [t.personId, t.skillId] })],
);

/**
 * Cuenta que puede entrar a la app (Google). Separada de people:
 * una persona del directorio puede no tener cuenta, y una cuenta puede no ser una persona del directorio.
 */
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name"),
    role: userRole("role").notNull().default("colaborador"),
    personId: integer("person_id").references(() => people.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);
