"use client";

import { useState } from "react";
import { useDemoEnquiries, moveDemoEnquiry, deleteDemoEnquiry, demoLeadStages, type DemoLeadStage } from "@/lib/studio/enquiries";
import { formatPrice } from "@/lib/configurator/desk";

export function DemoCrm() {
  const enquiries = useDemoEnquiries();
  const [message, setMessage] = useState("");
  return (
    <section className="nx-editor-card nx-crm">
      <span className="nx-eyebrow">CONFIGURATION-LED CRM · LOCAL PROTOTYPE</span>
      <h2>From design to conversation.</h2>
      <p>
        This is a browser-only simulation of the future manufacturer CRM. Only a deliberate
        &quot;Create demo enquiry&quot; action in the configurator adds an entry. No customer
        names, emails, real enquiries, messages, orders or payments are collected or sent. There are no real orders or messages in this demo.
      </p>
      <div className="nx-crm-summary">
        {demoLeadStages.map((stage) => (
          <article key={stage.value}>
            <strong>{enquiries.filter((e) => e.stage === stage.value).length}</strong>
            <span>{stage.label}</span>
          </article>
        ))}
      </div>
      {message && <p role="status" className="nx-save-status">{message}</p>}
      {!enquiries.length ? (
        <div className="nx-crm-empty">
          <h3>No demo enquiries yet.</h3>
          <p>Open Start Creating, customise the organiser and choose &quot;Create demo enquiry&quot; to see the full configuration appear here.</p>
        </div>
      ) : (
        <div className="nx-crm-list">
          {enquiries.map((lead) => (
            <article key={lead.id}>
              <div>
                <span className="nx-eyebrow">DEMO CONFIGURATION · {new Date(lead.createdAt).toLocaleDateString("en-GB")}</span>
                <h3>{lead.productName}</h3>
                <p>{lead.configuration.width} × {lead.configuration.depth} mm · {lead.configuration.material} · {lead.configuration.colour} · {lead.configuration.modules.length} modules</p>
                <strong>{formatPrice(lead.pricePence)} <small>illustrative, not a quote</small></strong>
                <details>
                  <summary>View saved configuration</summary>
                  <pre>{JSON.stringify(lead.configuration, null, 2)}</pre>
                </details>
              </div>
              <div className="nx-crm-actions">
                <label>
                  Enquiry stage
                  <select
                    aria-label={`Enquiry stage for ${lead.productName}`}
                    value={lead.stage}
                    onChange={(e) => setMessage(moveDemoEnquiry(lead.id, e.target.value as DemoLeadStage)
                      ? "Demo stage updated on this browser."
                      : "Could not update local demo stage.")}
                  >
                    {demoLeadStages.map((stage) => (
                      <option key={stage.value} value={stage.value}>{stage.label}</option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="nx-button nx-secondary"
                  onClick={() => setMessage(deleteDemoEnquiry(lead.id)
                    ? "Demo enquiry removed from this browser."
                    : "Could not remove demo enquiry.")}
                >
                  Remove demo
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
