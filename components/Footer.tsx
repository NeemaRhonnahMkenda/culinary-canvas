import { Icon } from "./icons";
import { container } from "./ui";

export default function Footer() {
  return (
    <footer className="mt-auto bg-cc-peach font-cc-display text-[15px] text-cc-ink">
      <div className={`${container} grid gap-10 pt-20 pb-14 sm:grid-cols-[1fr_1fr_2fr]`}>
        <div>
          <h2 className="mb-3 text-[17px]">Address</h2>
          <p className="leading-relaxed">
            Nairobi
            <br />
            Safari Park Avenue
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-[17px]">Contact Info</h2>
          <p className="leading-relaxed">
            Tel:{" "}
            <a href="tel:+254796403061" className="hover:text-cc-accent">
              +254 796 403 061
            </a>
            <br />
            Mail:{" "}
            <a href="mailto:nmkenda98@gmail.com" className="hover:text-cc-accent">
              nmkenda98@gmail.com
            </a>
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-[17px]">Follow</h2>
          <div className="flex gap-3">
            <a href="https://www.linkedin.com/in/neema-mkenda-bb52b4200/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-cc-accent">
              <Icon.LinkedIn className="size-[18px]" />
            </a>
            <a href="https://github.com/NeemaRhonnahMkenda" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-cc-accent">
              <Icon.GitHub className="size-[18px]" />
            </a>
          </div>
        </div>
      </div>
      <p className="px-4 pb-8 text-center font-cc-body text-cc-text">
        Copyright © {new Date().getFullYear()} a Project by{" "}
        <a href="https://github.com/NeemaRhonnahMkenda" target="_blank" rel="noopener noreferrer" className="text-cc-accent hover:text-cc-accent-hover">
          Neema Rhonnah Mkenda
        </a>
      </p>
    </footer>
  );
}
