---
title: Reddit Clone 2.0
subtitle: community / full-stack application
summary: A community discussion app with posts, nested comments, voting, and personalized feeds. The work brings authentication, relational data, and careful interaction handling into one full-stack product.
order: 2
category: Full-stack development
period: Personal software project
technologies: [Next.js, TypeScript, PostgreSQL, Prisma, Tailwind CSS]
thumbnail: ../../assets/reddit.png
thumbnailAlt: Reddit Clone’s public homepage showing community navigation, feed filters, a post, and a create-community panel.
caption: A screenshot of the application’s public homepage with feed controls and a test post. This is a personal engineering project, unaffiliated with Reddit.
sourceVisibility: public
repositoryUrl: https://github.com/NgoBenny/reddit-clone
demoUrl: https://reddit-clone-ashen.vercel.app
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

A discussion platform looks simple until its interactions meet persistent data. A vote must belong to one user, a post edit must belong to its author, and a failed submission should not erase someone’s draft. This personal project uses the familiar community-and-post model to explore those concerns across the frontend and backend.

The application combines Next.js and TypeScript with PostgreSQL through Prisma. Kinde provides authentication, and UploadThing supports image uploads. Users can create and join communities, publish posts, participate in comment threads, and vote. Feed controls support search, sorting, and community discovery.

My project work includes extending user interactions and improving the application’s reliability. The repository history records work on community features, content controls, and preserving rejected drafts. The case study describes those implemented changes without claiming to have independently invented every library, interface pattern, or original scaffold.

## Engineering decisions

### Enforce permissions where data changes

Showing an edit button only to an author is useful interface behavior, but it is not an authorization boundary. Requests can bypass the visible controls. Server actions validate the input and check the authenticated user against the record being changed.

Community description updates filter by both the community and its creator. Post and comment controls apply their own ownership and moderation checks. The resulting permissions live alongside the write operation, so the interface is not the only thing standing between a user and someone else’s content.

### Make voting consistent

Voting affects multiple pieces of state: a stored vote, the score, and the selected button shown to the current user. Independent client booleans can drift apart, particularly when a user changes a vote or reloads the page.

The interface derives the selected state from the persisted vote. The write path uses a serializable transaction with bounded conflict retries. Updated pages are invalidated so the feed and post detail reflect the same result. This makes the interaction more dependable without adding a separate state-management layer.

### Keep drafts when an action fails

Posting and commenting are small workflows with a real cost of failure: losing the text someone just wrote. Rejected actions retain their draft, and validation feedback explains the problem. Server checks bound text and rich-text input, while the renderer supports the editor’s document structure without blindly spreading stored attributes into the page.

These details also matter for navigation and empty states. Invalid pagination falls back safely, missing communities receive a proper not-found page, and mobile layouts keep posts and controls within the viewport.

## Demonstrated functionality

The repository contains authentication, communities, rich-text and image posts, comments, votes, profiles, discovery, and moderation-related controls. It includes runnable regression and database-safety checks, with additional feature and browser checks for interaction flows.

The project’s recovery work also exposed an operational dependency: when its hosted database became unavailable, the homepage failed even though the deployment itself had completed. Restoring the data and connection configuration brought the application back. That experience informed the project’s database diagnostics and recovery documentation.

There are no supported adoption figures or benchmark claims attached to this project. The result is a working software implementation and its documented engineering changes, rather than an invented user count or performance percentage.

## Limitations and lessons

Hosted authentication, database, and upload services remain dependencies of the running application. A successful build cannot establish that all of those services are healthy. Public demo availability is checked separately; the source is available through the repository link above.

The lesson is to follow a user action all the way through validation, permissions, persistence, and feedback. Keeping a draft after an error or reconciling a vote after a reload is just as much engineering as rendering the initial page.
