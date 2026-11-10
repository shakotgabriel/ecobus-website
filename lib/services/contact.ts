/**
 * Contact API Service
 * Handles contact form submissions
 */

import { apiClient } from "@/lib/api-client";

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactFormResponse {
  id?: string;
  message?: string;
  success: boolean;
}

export const contactService = {
  /**
   * Submit contact form
   */
  async submitContactForm(formData: ContactFormData) {
    try {
      const response = await apiClient.post<ContactFormResponse>(
        "/contact/",
        formData
      );
      return { data: response, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to submit contact form",
      };
    }
  },
};
