/**
 * Stackra file contract:
 * Purpose: the page folder's barrel.
 * Boundary: explicit export only; the route imports the page from here, the page imports the route
 *           as a type.
 * Runtime: react-native
 * Governing contract: ADR 0128
 */
export { ProfilePage } from "./profile";
