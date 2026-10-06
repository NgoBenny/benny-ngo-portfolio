---
title: Common
subtitle: community / full-stack application
summary: A full-stack community discussion app with responsive feeds, rich-text posts, and readable threaded replies. Server-side permissions, scoped participation restrictions, and reversible community removal connect moderation controls to persistent data.
order: 2
category: Full-stack development
period: Personal software project
technologies: [Next.js, TypeScript, PostgreSQL, Prisma, Tailwind CSS]
thumbnail: ../../assets/common.png
thumbnailAlt: Common’s public search results showing its indigo and lavender identity, desktop community navigation, feed filters, and a rich-text test post.
caption: A current capture of Common’s public interface, filtered to a real rich-text test post. The screen shows desktop navigation, search, voting, and saved-post controls.
sourceVisibility: public
repositoryUrl: https://github.com/NgoBenny/common
demoUrl: https://common-ngobenny.vercel.app
highlights:
  - value: Full-stack
    label: Interface to persistence
  - value: PostgreSQL
    label: Relational data model
  - value: Auth + roles
    label: Server-side permissions
architecture:
  - title: Interface
    detail: Next.js + TypeScript
  - title: Identity
    detail: Kinde authentication
  - title: Actions
    detail: Validation + permissions
  - title: Storage
    detail: Prisma + PostgreSQL
---

## The problem

A discussion platform looks simple until its interactions meet persistent data. A vote must belong to one user, a post edit must belong to its author, and a failed submission should not erase someone’s draft. Common is my evolving community discussion project, originally developed as Reddit Clone 2.0 and now presented with its own identity and responsive browsing experience.

The application combines Next.js and TypeScript with PostgreSQL through Prisma. Kinde provides authentication, and UploadThing supports image uploads. Users can create and join communities, publish posts, participate in comment threads, and vote. Feed controls support search, sorting, and community discovery; saved posts, profiles, and in-app notifications round out the implemented community workflows.

My project work includes extending user interactions, improving reliability, and evolving the interface into Common. Recent merged changes introduce an original visual identity, responsive navigation, a shared composer, and explicit sign-in choices. The case study describes implemented changes without claiming to have independently invented every library, interface pattern, or original scaffold.

## Engineering decisions

### Enforce permissions where data changes

Showing an edit button only to an author is useful interface behavior, but it is not an authorization boundary. Requests can bypass the visible controls. Server actions validate the input and check the authenticated user against the record being changed.

Server actions enforce ownership and moderation permissions alongside writes. Community creators can apply community-scoped bans; the site moderator can apply site-wide restrictions and remove or restore communities. Restrictions are checked from the database at request time, including expiry, while transaction locks coordinate restrictions and removal with participation writes. Removal hides existing content without deleting it. Restricted users retain permitted activities such as reading and erasing their own content.

### Make voting consistent

Voting affects multiple pieces of state: a stored vote, the score, and the selected button shown to the current user. Independent client booleans can drift apart, particularly when a user changes a vote or reloads the page.

The interface derives the selected state from the persisted vote. The write path uses a serializable transaction with bounded conflict retries. Updated pages are invalidated so the feed and post detail reflect the same result. This makes the interaction more dependable without adding a separate state-management layer.

### Keep drafts when an action fails

Posting and commenting are small workflows with a real cost of failure: losing the text someone just wrote. Rejected actions retain their draft, and validation feedback explains the problem. Server checks bound text and rich-text input, while the renderer supports the editor’s document structure without blindly spreading stored attributes into the page.

These details also matter for navigation and empty states. Invalid pagination falls back safely, missing communities receive a proper not-found page, and mobile layouts keep posts and controls within the viewport.

Before post creation or editing, the composer normalizes editor JSON into plain objects accepted by React server actions. This addresses ProseMirror’s null-prototype attributes; server-side validation remains authoritative.

### Make the same workflows usable across devices

The redesign gives Common cream surfaces, indigo and lavender accents, and light and dark themes. Desktop browsing uses a navigation rail and a contextual community panel. On smaller screens, navigation moves to a bottom bar exposing the joined feed, Explore, Post, Saved, and Notifications; search gets its own header row where space is limited.

A shared composer handles creation and editing, with title, rich text, attachment preview, and community flair. Failed submissions preserve the draft, and an upload in progress disables submission. Kinde login explicitly offers sign-in choices, while the account menu exposes Switch account without discarding normal session persistence. These changes make existing functionality easier to reach while retaining the server-side authorization boundary.

Threaded comments limit visual indentation, wrap long content, and place action menus beside reply controls. Inline reply composers preserve cancelled drafts and return keyboard focus to Reply. Targeted browser checks cover deep nesting, keyboard collapse, focus, draft retention, and mobile overflow.

### Bound vulnerable tooling

The project applies checksum-verified nesting-depth guards to the `braces` dependency used by build and lint tooling. Installation and prebuild checks verify the patch, and bounded attack tests exercise it. The audit exception covers only the documented advisory and expires October 17, 2026 UTC; raw npm audit still reports the upstream vulnerability.

## Demonstrated functionality

The repository contains authentication, communities, rich-text and image posts, threaded replies, votes, private saves, profiles, discovery, notifications, community rules and flair, and report-review controls. It includes runnable regression, feature, browser, and database-safety checks. Its feature report documents checks against an isolated PostgreSQL database, including guest writes, other-author edits, cross-community moderation, and private notification access; those are reported project checks, not portfolio visitor tests.

The project’s recovery work also exposed an operational dependency: when its hosted database became unavailable, the homepage failed even though the deployment itself had completed. Restoring the data and connection configuration brought the application back. That experience informed the project’s database diagnostics and recovery documentation.

There are no supported adoption figures or benchmark claims attached to this project. The result is a working software implementation and its documented engineering changes, rather than an invented user count or performance percentage.

## Limitations and lessons

Hosted authentication, database, and upload services remain dependencies of the running application. A successful build cannot establish that all of those services are healthy. The Common demo address currently redirects to the existing production address, which displays the redesigned Common interface. Repository release notes include migration and domain-cutover steps, so this case study distinguishes implemented code from an assertion that every production workflow has been independently verified.

Notifications refresh on navigation or reload rather than push delivery. Search uses PostgreSQL ILIKE, and post pages load the reply tree; indexed search and thread pagination would become useful as measured volume grows. There are no adoption or scalability benchmarks supporting a stronger claim.

The moderation release requires an additive database migration and backup verification. Repository implementation and regression coverage do not independently establish that the production migration and every restricted-user workflow have been verified.

The lesson is to follow a user action all the way through validation, permissions, persistence, and feedback. Keeping a draft after an error or reconciling a vote after a reload is just as much engineering as rendering the initial page.
