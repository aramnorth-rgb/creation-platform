"use client";
import { useState } from "react";
export function ManufacturerInterest() {
  const [note, setNote] = useState("");
  return (
    <form
      className="nx-interest-form"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setNote(
          `Founding manufacturer interest\nBusiness: ${data.get("business")}\nContact: ${data.get("email")}\nProducts: ${data.get("products")}\n\n${data.get("message")}`,
        );
      }}
    >
      <h3>Start with a little about your business.</h3>
      <p>
        This form prepares a note on your device. It does not send an enquiry or
        register an account.
      </p>
      <label>
        Business name
        <input name="business" required maxLength={100} />
      </label>
      <label>
        Work email
        <input name="email" type="email" required maxLength={160} />
      </label>
      <label>
        What do you make?
        <input name="products" required maxLength={200} />
      </label>
      <label>
        What would you like to explore?
        <textarea name="message" rows={3} maxLength={1000} />
      </label>
      <button className="nx-button nx-primary" type="submit">
        Prepare interest note
      </button>
      {note && (
        <div role="status" className="nx-local-note">
          <strong>Your note is ready locally. It has not been sent.</strong>
          <pre>{note}</pre>
          <button
            type="button"
            className="nx-button nx-secondary"
            onClick={() => {
              const url = URL.createObjectURL(
                new Blob([note], { type: "text/plain" }),
              );
              const a = document.createElement("a");
              a.href = url;
              a.download = "nitorix-founding-interest.txt";
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
          >
            Download your note
          </button>
          <p>
            Formal applications and a contact channel will be added when the
            programme opens.
          </p>
        </div>
      )}
    </form>
  );
}
