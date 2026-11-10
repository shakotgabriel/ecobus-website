/**
 * Ticket download utilities. The public PDF endpoint needs the per-ticket
 * `download_token` returned by the booking lookup.
 */

import { API_BASE_URL } from "./config";

export type DownloadableTicket = {
  ticket_number: string;
  download_token?: string;
};

function ticketPdfUrl(ticket: DownloadableTicket): string {
  const url = `${API_BASE_URL}/tickets/pdf/${encodeURIComponent(ticket.ticket_number)}/`;
  return ticket.download_token ? `${url}?token=${encodeURIComponent(ticket.download_token)}` : url;
}

export async function downloadTicketPDF(ticket: DownloadableTicket): Promise<{
  error: string | null;
}> {
  try {
    const response = await fetch(ticketPdfUrl(ticket));
    if (!response.ok) {
      throw new Error(
        response.status === 403
          ? "This ticket link has expired. Look up your booking again to download it."
          : "Failed to download ticket PDF",
      );
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${ticket.ticket_number}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { error: null };
  } catch (error: unknown) {
    return {
      error: error instanceof Error ? error.message : "Failed to download PDF",
    };
  }
}

/** Opens the ticket PDF in a new tab for printing. */
export function printTicket(ticket: DownloadableTicket): void {
  window.open(ticketPdfUrl(ticket), "_blank");
}
