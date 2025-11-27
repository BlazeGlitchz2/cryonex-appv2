/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as affiliates from "../affiliates.js";
import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as autoGenerate from "../autoGenerate.js";
import type * as bytez from "../bytez.js";
import type * as chat from "../chat.js";
import type * as chats from "../chats.js";
import type * as courses from "../courses.js";
import type * as files from "../files.js";
import type * as globalSearch from "../globalSearch.js";
import type * as gpts from "../gpts.js";
import type * as http from "../http.js";
import type * as kanban from "../kanban.js";
import type * as keys from "../keys.js";
import type * as library from "../library.js";
import type * as meetingNotes from "../meetingNotes.js";
import type * as messages from "../messages.js";
import type * as mindMapAI from "../mindMapAI.js";
import type * as mindMaps from "../mindMaps.js";
import type * as pdfChat from "../pdfChat.js";
import type * as pdfProcessor from "../pdfProcessor.js";
import type * as playground from "../playground.js";
import type * as projects from "../projects.js";
import type * as search from "../search.js";
import type * as spotify from "../spotify.js";
import type * as spotifyChat from "../spotifyChat.js";
import type * as spotifyConnection from "../spotifyConnection.js";
import type * as studio from "../studio.js";
import type * as study from "../study.js";
import type * as studyExtractor from "../studyExtractor.js";
import type * as studyMutations from "../studyMutations.js";
import type * as studyQuery from "../studyQuery.js";
import type * as templates from "../templates.js";
import type * as uiTars from "../uiTars.js";
import type * as users from "../users.js";
import type * as youtube from "../youtube.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  affiliates: typeof affiliates;
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  autoGenerate: typeof autoGenerate;
  bytez: typeof bytez;
  chat: typeof chat;
  chats: typeof chats;
  courses: typeof courses;
  files: typeof files;
  globalSearch: typeof globalSearch;
  gpts: typeof gpts;
  http: typeof http;
  kanban: typeof kanban;
  keys: typeof keys;
  library: typeof library;
  meetingNotes: typeof meetingNotes;
  messages: typeof messages;
  mindMapAI: typeof mindMapAI;
  mindMaps: typeof mindMaps;
  pdfChat: typeof pdfChat;
  pdfProcessor: typeof pdfProcessor;
  playground: typeof playground;
  projects: typeof projects;
  search: typeof search;
  spotify: typeof spotify;
  spotifyChat: typeof spotifyChat;
  spotifyConnection: typeof spotifyConnection;
  studio: typeof studio;
  study: typeof study;
  studyExtractor: typeof studyExtractor;
  studyMutations: typeof studyMutations;
  studyQuery: typeof studyQuery;
  templates: typeof templates;
  uiTars: typeof uiTars;
  users: typeof users;
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
