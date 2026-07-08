'use client'
import React from "react";
import { trackEvent } from "../functions";

export default function TestPage() {
  function test() {
    trackEvent("test", { testing: true });
  }
  return (
    <div>
      <button onClick={test} className="btn btn-primary">
        test the analytics
      </button>
    </div>
  );
}
