import { ROLES } from "@/lib/auth/roles";
import {
  boolean,
  integer,
  jsonb,
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
export const ideaStatus = pgEnum("idea_status", ["abierta", "en_evaluacion", "cerrada", "convertida"]);


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
    /** Se marca al cerrar el recorrido (terminado u omitido): no vuelve a abrirse solo. */
    tourClosedAt: timestamp("tour_closed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

export const projectStatus = pgEnum("project_status", ["propuesta", "activo", "cerrado"]);

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  client: text("client"),
  description: text("description"),
  status: projectStatus("status").notNull().default("propuesta"),
  createdByEmail: text("created_by_email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const squads = pgTable("squads", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});

/** Solo personas confirmadas deberían entrar a un squad (se valida en la acción). */
export const squadMembers = pgTable(
  "squad_members",
  {
    squadId: integer("squad_id")
      .notNull()
      .references(() => squads.id, { onDelete: "cascade" }),
    personId: integer("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    roleInSquad: text("role_in_squad"),
    allocationPct: integer("allocation_pct").notNull().default(100),
  },
  (t) => [primaryKey({ columns: [t.squadId, t.personId] })],
);

export const ideas = pgTable("ideas", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: ideaStatus("status").notNull().default("abierta"),
  createdByEmail: text("created_by_email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  /** Idea de origen, si la propuesta nació de una idea. */
  ideaId: integer("idea_id").references(() => ideas.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  discountPct: integer("discount_pct").notNull().default(0),
  notes: text("notes"),
  createdByEmail: text("created_by_email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const proposalItems = pgTable("proposal_items", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id")
    .notNull()
    .references(() => proposals.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  hours: integer("hours").notNull(),
  hourlyRate: integer("hourly_rate").notNull(),
});


/** Votos de ideas: una persona vota una vez por idea. */
export const ideaVotes = pgTable(
  "idea_votes",
  {
    ideaId: integer("idea_id")
      .notNull()
      .references(() => ideas.id, { onDelete: "cascade" }),
    userEmail: text("user_email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.ideaId, t.userEmail] })],
);

export const ideaComments = pgTable("idea_comments", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id")
    .notNull()
    .references(() => ideas.id, { onDelete: "cascade" }),
  authorEmail: text("author_email").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Preferencias de widgets del inicio, por usuario. Se guarda la lista completa normalizada. */
export const userPreferences = pgTable("user_preferences", {
  userEmail: text("user_email").primaryKey(),
  widgets: jsonb("widgets").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
