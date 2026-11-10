"use client";
import Image from "next/image";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactService } from "@/lib/services";
import { PUBLIC_IMAGES } from "@/lib/public-images";
import {
  COMPANY_EMAIL,
  COMPANY_HOURS,
  COMPANY_OFFICES,
  COMPANY_PHONES,
  COMPANY_TAGLINE,
  telHref,
} from "@/lib/company";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await contactService.submitContactForm(formData);

    if (error) {
      toast.error(`Failed to send message: ${error}`);
    } else {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Message sent successfully! We will get back to you soon.");

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <main id="main-content" className="pt-16">
        <section className="relative min-h-[42vh] flex items-end overflow-hidden sm:min-h-[48vh]">
          <Image
            src={PUBLIC_IMAGES.bus1}
            alt="EcoBus coach"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.22_0.06_255_/_0.3)_0%,oklch(0.22_0.06_255_/_0.86)_100%)]" />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 pt-28 sm:px-6 sm:pb-16 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Get in touch
              </p>
              <h1 className="mt-3 max-w-2xl font-display text-3xl font-semibold text-white text-balance md:text-5xl">
                Contact us
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75">
                {COMPANY_TAGLINE}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl p-6 sm:p-8 border h-fit border-border"
              >
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Send Us a Message
                </h2>
                <p className="text-muted-foreground mb-8">
                  Fill out the form and we&apos;ll get back to you within 24
                  hours.
                </p>

                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Thank you for reaching out. We&apos;ll respond shortly.
                    </p>
                    <Button onClick={() => setIsSubmitted(false)}>
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-name" className="text-sm font-medium text-foreground mb-2 block">
                          Full Name *
                        </label>
                        <Input
                          id="contact-name"
                          required
                          autoComplete="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="text-sm font-medium text-foreground mb-2 block">
                          Email *
                        </label>
                        <Input
                          id="contact-email"
                          required
                          autoComplete="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              email: e.target.value,
                            })
                          }
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-phone-number" className="text-sm font-medium text-foreground mb-2 block">
                          Phone Number
                        </label>
                        <Input id="contact-phone-number"
                          type="tel"
                          autoComplete="tel"
                          placeholder="+211 926 388 115"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              phone: e.target.value,
                            })
                          }
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-subject" className="text-sm font-medium text-foreground mb-2 block">
                          Subject *
                        </label>
                        <Input
                          id="contact-subject"
                          required
                          placeholder="Booking inquiry"
                          value={formData.subject}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              subject: e.target.value,
                            })
                          }
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="text-sm font-medium text-foreground mb-2 block">
                        Message *
                      </label>
                      <Textarea
                          id="contact-message"
                        required
                        rows={5}
                        placeholder="How can we help you?"
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            message: e.target.value,
                          })
                        }
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          Send Message
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </motion.div>

              {/* Office Locations */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Contact Us
                  </h2>
                  <p className="text-muted-foreground">
                    Call your nearest EcoBus office.
                  </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="grid gap-5 sm:grid-cols-3">
                    {COMPANY_PHONES.map((office) => (
                      <div key={office.city}>
                        <h3 className="text-base font-semibold text-foreground mb-2">
                          {office.city}
                        </h3>
                        {office.numbers.map((number) => (
                          <a
                            key={number}
                            href={telHref(number)}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                          >
                            <Phone className="w-4 h-4 text-primary shrink-0" />
                            {number}
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 space-y-3 border-t border-border pt-5">
                    <a
                      href={`mailto:${COMPANY_EMAIL}`}
                      className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary"
                    >
                      <Mail className="w-5 h-5 text-primary shrink-0" />
                      {COMPANY_EMAIL}
                    </a>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Clock className="w-5 h-5 text-primary shrink-0" />
                      {COMPANY_HOURS}
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Our Offices
                  </h3>
                  <ul className="space-y-3">
                    {COMPANY_OFFICES.map((office) => (
                      <li key={office.name} className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {office.name}
                          </span>
                          {" – "}
                          {office.detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
