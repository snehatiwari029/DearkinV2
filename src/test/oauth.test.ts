import { beforeEach, describe, expect, it } from "vitest";
import { oauthCallbackUrl, rememberOAuthRedirect, safePath, takeOAuthRedirect } from "@/lib/oauth";

describe("oauth helpers", () => {
  beforeEach(() => sessionStorage.clear());

  it("builds the callback URL from the origin", () => {
    expect(oauthCallbackUrl("https://dearkin.com")).toBe("https://dearkin.com/auth/callback");
  });

  it("only accepts same-origin paths", () => {
    expect(safePath("/invite/abc")).toBe("/invite/abc");
    expect(safePath("//evil.example")).toBeUndefined();
    expect(safePath("https://evil.example")).toBeUndefined();
    expect(safePath(undefined)).toBeUndefined();
  });

  it("hands the remembered redirect back once", () => {
    rememberOAuthRedirect("/invite/abc");
    expect(takeOAuthRedirect()).toBe("/invite/abc");
    expect(takeOAuthRedirect()).toBeUndefined();
  });

  it("clears a stale redirect when none is given", () => {
    rememberOAuthRedirect("/invite/abc");
    rememberOAuthRedirect(undefined);
    expect(takeOAuthRedirect()).toBeUndefined();
  });
});
