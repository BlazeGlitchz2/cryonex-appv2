/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as affiliates from "../affiliates.js";
import type * as aiRouting from "../aiRouting.js";
import type * as assets from "../assets.js";
import type * as audio from "../audio.js";
import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as autoGenerate from "../autoGenerate.js";
import type * as bytez from "../bytez.js";
import type * as chat from "../chat.js";
import type * as chatHelpers from "../chatHelpers.js";
import type * as chats from "../chats.js";
import type * as courses from "../courses.js";
import type * as credits from "../credits.js";
import type * as debug_bytez from "../debug_bytez.js";
import type * as debug_models from "../debug_models.js";
import type * as embeddings from "../embeddings.js";
import type * as files from "../files.js";
import type * as globalSearch from "../globalSearch.js";
import type * as gpts from "../gpts.js";
import type * as http from "../http.js";
import type * as huggingface from "../huggingface.js";
import type * as imageOcclusion from "../imageOcclusion.js";
import type * as kanban from "../kanban.js";
import type * as keys from "../keys.js";
import type * as knowledgeGaps from "../knowledgeGaps.js";
import type * as knowledgeGraph from "../knowledgeGraph.js";
import type * as lib_aiEnvironment from "../lib/aiEnvironment.js";
import type * as lib_aiRouter from "../lib/aiRouter.js";
import type * as lib_aiRouting from "../lib/aiRouting.js";
import type * as library from "../library.js";
import type * as libraryActions from "../libraryActions.js";
import type * as meetingNotes from "../meetingNotes.js";
import type * as messages from "../messages.js";
import type * as mindMapAI from "../mindMapAI.js";
import type * as mindMaps from "../mindMaps.js";
import type * as music from "../music.js";
import type * as pdfChat from "../pdfChat.js";
import type * as pdfProcessor from "../pdfProcessor.js";
import type * as performance from "../performance.js";
import type * as playground from "../playground.js";
import type * as pollinations from "../pollinations.js";
import type * as projects from "../projects.js";
import type * as replicate from "../replicate.js";
import type * as school from "../school.js";
import type * as scratch_test_routing from "../scratch_test_routing.js";
import type * as search from "../search.js";
import type * as smartPricing from "../smartPricing.js";
import type * as social from "../social.js";
import type * as spotify from "../spotify.js";
import type * as spotifyChat from "../spotifyChat.js";
import type * as spotifyConnection from "../spotifyConnection.js";
import type * as srs from "../srs.js";
import type * as studio from "../studio.js";
import type * as study from "../study.js";
import type * as studyExtractor from "../studyExtractor.js";
import type * as studyMutations from "../studyMutations.js";
import type * as studyQuery from "../studyQuery.js";
import type * as studyRuntime from "../studyRuntime.js";
import type * as support from "../support.js";
import type * as templates from "../templates.js";
import type * as titles from "../titles.js";
import type * as uiTars from "../uiTars.js";
import type * as updates from "../updates.js";
import type * as users from "../users.js";
import type * as vault from "../vault.js";
import type * as viral from "../viral.js";
import type * as youtube from "../youtube.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  affiliates: typeof affiliates;
  aiRouting: typeof aiRouting;
  assets: typeof assets;
  audio: typeof audio;
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  autoGenerate: typeof autoGenerate;
  bytez: typeof bytez;
  chat: typeof chat;
  chatHelpers: typeof chatHelpers;
  chats: typeof chats;
  courses: typeof courses;
  credits: typeof credits;
  debug_bytez: typeof debug_bytez;
  debug_models: typeof debug_models;
  embeddings: typeof embeddings;
  files: typeof files;
  globalSearch: typeof globalSearch;
  gpts: typeof gpts;
  http: typeof http;
  huggingface: typeof huggingface;
  imageOcclusion: typeof imageOcclusion;
  kanban: typeof kanban;
  keys: typeof keys;
  knowledgeGaps: typeof knowledgeGaps;
  knowledgeGraph: typeof knowledgeGraph;
  "lib/aiEnvironment": typeof lib_aiEnvironment;
  "lib/aiRouter": typeof lib_aiRouter;
  "lib/aiRouting": typeof lib_aiRouting;
  library: typeof library;
  libraryActions: typeof libraryActions;
  meetingNotes: typeof meetingNotes;
  messages: typeof messages;
  mindMapAI: typeof mindMapAI;
  mindMaps: typeof mindMaps;
  music: typeof music;
  pdfChat: typeof pdfChat;
  pdfProcessor: typeof pdfProcessor;
  performance: typeof performance;
  playground: typeof playground;
  pollinations: typeof pollinations;
  projects: typeof projects;
  replicate: typeof replicate;
  school: typeof school;
  scratch_test_routing: typeof scratch_test_routing;
  search: typeof search;
  smartPricing: typeof smartPricing;
  social: typeof social;
  spotify: typeof spotify;
  spotifyChat: typeof spotifyChat;
  spotifyConnection: typeof spotifyConnection;
  srs: typeof srs;
  studio: typeof studio;
  study: typeof study;
  studyExtractor: typeof studyExtractor;
  studyMutations: typeof studyMutations;
  studyQuery: typeof studyQuery;
  studyRuntime: typeof studyRuntime;
  support: typeof support;
  templates: typeof templates;
  titles: typeof titles;
  uiTars: typeof uiTars;
  updates: typeof updates;
  users: typeof users;
  vault: typeof vault;
  viral: typeof viral;
  youtube: typeof youtube;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
