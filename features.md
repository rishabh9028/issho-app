# Issho App - Detailed Features Document

This document outlines all the detailed features and technical capabilities of the Issho Hourly Property Booking Application.

## 1. Authentication & User Profiles
*   **Role-Based Access Control:** Separate flows and dashboards for **Guests** and **Hosts** (along with Admin capabilities).
*   **Secure Authentication:** Powered by Supabase Auth (Sign up, Log in, Password management).
*   **User Profiles:** Users can manage their personal details, profile pictures, and contact information.

## 2. Guest Experience & Discovery
*   **Advanced Search Widget (Hero Search):**
    *   **Location Search:** Powered by Address Autocomplete to find specific cities or neighborhoods.
    *   **Date Range Picker:** Allows users to select desired dates for their stay.
    *   **Guest Picker:** Select number of adults, children, and infants.
*   **Interactive Discoverability:**
    *   Browse spaces by categories (Villa, Studio, Cafe, Rooftop, etc.).
    *   Interactive map-based search results.
*   **Detailed Space Pages:**
    *   **Immersive Media Gallery:** Grid-based photo layouts with full-screen gallery modes.
    *   **Location Mapping:** Interactive localized maps emphasizing the space's location while protecting exact addresses until booking.
    *   **Host Identification:** Host avatar, name, and join date.
    *   **Amenities Display:** Visual icons for facilities like Fast WiFi, Free Parking, Kitchen, Coffee, TV, Projector, Whiteboard, and CCTV.
    *   **Pet-Friendly Indicator:** Explicit marking for pet-friendly spaces.
*   **Favorites System:** Ability for users to save and bookmark preferred spaces.

## 3. Advanced Booking & Pricing Engine
*   **Granular Hourly Booking:**
    *   Users book by the hour, not the night.
    *   Time slot picker that reads real-time host availability.
    *   **Buffer Time Logic:** Automatically blocks out time slots directly before or after an existing booking to allow for cleaning/setup (e.g., 1-hour buffer).
    *   **Past Date Blocking:** Prevents booking requests for past dates or past times on the current day.
*   **Dynamic & Smart Pricing Model:**
    *   **Base Pricing:** Calculated dynamically via `Hourly Rate × Duration`.
    *   **Extra Guest Modules:** Automatically adjusts pricing if the user requests more guests than standard capacity `(Extra Guests × Extra Price × Duration)`.
    *   **Lead-time Based Pricing Tiers:**
        *   *Last Minute:* Non-refundable low-lead bookings.
        *   *Save 5%:*(3-5 hour lead) Non-refundable discount.
        *   *Flexible:* Refundable bookings carrying a +10% premium fee.
        *   *Standard:* Default non-refundable rate.
*   **Transparent Cost Breakdown:** 
    *   Guest view shows Base Price + Guest Service Fees.
    *   Host view shows Gross Rate minus Platform Commission (10%) and Platform GST (18%), arriving at a Net Host Payout amount.

## 4. Host Management System
*   **Premium Space Creation Workflow (6-Step Wizard):**
    1.  **Basics:** Title, Category/Type, Capacity, Rich Description, Extra Guest Allowance (Max limit & fee), Specific Amenities selection, Pet Rules.
    2.  **Location:** Map pin-drop interface and structured address autocomplete parsing (City, State, Zip).
    3.  **Pricing:** Hourly rate setup with an immediate **Smart Pricing Breakdown** showing exactly what the host will earn after platform fees and taxes.
    4.  **Photos:** Drag-and-drop secure image fetching mapping to Supabase Storage, with cover photo selection logic.
    5.  **Availability Configuration:** Day-by-day scheduling (open/closed) and specific operation hours (e.g., 9:00 AM to 5:00 PM) for each day of the week.
    6.  **Review System:** Final check presenting a consolidated preview of the listing.
*   **Booking Management:** Hosts can view, accept, or reject incoming hourly booking requests.
*   **Earnings Dashboard:** Analytics regarding income generated, upcoming payouts, and historical metrics.

## 5. Reviews and Trust
*   **Guest Reviews:** Post-booking review system where guests rate spaces out of 5 stars and leave textual feedback.
*   **Real-time Review Updates:** Powered by Supabase Realtime Channels, reviews appear on the space page dynamically without refreshing.
*   **Host Credibility:** "Gold Host" tiers and metrics (review count, aggregate rating out of 5).

## 6. Technical & UI/UX Features
*   **Premium Aesthetics:** Built featuring glassmorphism elements, micro-animations, curated vibrant color palettes (Deep Blues), and sleek dark mode inputs.
*   **Responsive Application:** Mobile-first design that adapts seamlessly to desktop environments (e.g., floating booking widgets on desktop, drawer menus on mobile).
*   **Tech Stack Details:** Next.js 16 (App Router), React 19, TailwindCSS v4, Supabase (Auth, Postgres DB, Realtime, Storage), and Lucide Icons.
