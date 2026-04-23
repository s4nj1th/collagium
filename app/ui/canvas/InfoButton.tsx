"use client";

import Link from "next/link";
import { useState } from "react";
import { BsInfoCircle, BsGithub } from "react-icons/bs";

export function InfoButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="mb-2 overflow-hidden rounded-2xl border border-border-glass bg-bg-glass p-4 shadow-2xl backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-4 duration-300 text-center">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text-main/70">
                &copy; {new Date().getFullYear()} {" "}
                <Link href="https://www.s4nj1th.me" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-text-main">
                  S4NJ1TH
                </Link>
              </span>
            </div>
            <div className="h-px bg-border-glass" />
            <Link
              href="https://github.com/s4nj1th/collagium"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-text-main/70 transition-colors hover:text-text-main"
            >
              <BsGithub size={16} />
              <span>Source Code</span>
            </Link>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-10 w-10 items-center justify-center rounded-full border border-border-glass bg-bg-glass text-text-main shadow-xl backdrop-blur-3xl transition-all duration-600 hover:scale-110 active:scale-95 ${
          isOpen ? "rotate-360 bg-text-main !text-bg-app border-transparent" : ""
        }`}
        title="Credits & Info"
      >
        <BsInfoCircle size={20} />
      </button>
    </div>
  );
}
