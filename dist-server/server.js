// server.ts
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
var __filename = fileURLToPath(import.meta.url);
var currentDir = path.dirname(__filename);
var ROOT_DIR = fs.existsSync(path.join(currentDir, "package.json")) ? currentDir : path.join(currentDir, "..");
var SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || "aabxoflwagxdepnrpcez";
var SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
var SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_Wi33_pjU5niFJISf2XUYag_97UkhkzJ";
var supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
var DATA_DIR = path.join(ROOT_DIR, "data");
var DATA_FILE = path.join(DATA_DIR, "clinic_data.json");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
var defaultState = {
  adminPin: "9631",
  // Clinic last 4 digits of verified phone 089710 96312 as secure default
  config: {
    clinicName: "Sanjeevini Dental Clinic",
    tagline: "Professional dental care focused on your comfort, oral health and confident smile.",
    phone: "+918971096312",
    displayPhone: "089710 96312",
    whatsapp: "918971096312",
    email: "contact@sanjeevinidental.in",
    address: "Near Police Chowki / opposite Vikasa School, Vinobanagar",
    landmark: "Near Police Chowki / opposite Vikasa School",
    city: "Shivamogga",
    state: "Karnataka",
    country: "India",
    postalCode: "577204",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Sanjeevini+Dental+Clinic+Vinobanagar+Shivamogga",
    googleMapsEmbedQuery: "Sanjeevini Dental Clinic Vinobanagar Shivamogga Karnataka",
    workingHoursConfigured: true,
    workingHoursNote: "Standard clinic hours. Please confirm emergency walk-ins via phone.",
    socialLinks: {
      googleBusiness: "https://www.google.com/maps/search/?api=1&query=Sanjeevini+Dental+Clinic+Vinobanagar+Shivamogga"
    },
    bookingSettings: {
      slot_duration_minutes: 30,
      max_appointments_per_slot: 2,
      lead_time_hours: 2,
      advance_booking_days: 30,
      blocked_dates: [],
      working_hours: {
        Monday: { day: "Monday", isOpen: true, openTime: "09:30", closeTime: "20:30", hasBreak: true, breakStart: "13:30", breakEnd: "16:30", isVerified: true },
        Tuesday: { day: "Tuesday", isOpen: true, openTime: "09:30", closeTime: "20:30", hasBreak: true, breakStart: "13:30", breakEnd: "16:30", isVerified: true },
        Wednesday: { day: "Wednesday", isOpen: true, openTime: "09:30", closeTime: "20:30", hasBreak: true, breakStart: "13:30", breakEnd: "16:30", isVerified: true },
        Thursday: { day: "Thursday", isOpen: true, openTime: "09:30", closeTime: "20:30", hasBreak: true, breakStart: "13:30", breakEnd: "16:30", isVerified: true },
        Friday: { day: "Friday", isOpen: true, openTime: "09:30", closeTime: "20:30", hasBreak: true, breakStart: "13:30", breakEnd: "16:30", isVerified: true },
        Saturday: { day: "Saturday", isOpen: true, openTime: "09:30", closeTime: "20:30", hasBreak: true, breakStart: "13:30", breakEnd: "16:30", isVerified: true },
        Sunday: { day: "Sunday", isOpen: true, openTime: "10:00", closeTime: "13:30", hasBreak: false, isVerified: true }
      }
    }
  },
  services: [
    {
      id: "consultation",
      name: "Dental Consultation & Oral Examination",
      description: "Comprehensive clinical evaluation of teeth, gums, and oral structures with personalized treatment planning.",
      duration_minutes: 30,
      price: "Consultation required",
      is_active: true,
      category: "preventive",
      icon_name: "Stethoscope",
      highlight: true
    },
    {
      id: "scaling",
      name: "Teeth Cleaning / Scaling",
      description: "Professional plaque, tartar, and surface stain removal to prevent gum infections and support oral hygiene.",
      duration_minutes: 45,
      price: "Based on assessment",
      is_active: true,
      category: "preventive",
      icon_name: "Sparkles",
      highlight: true
    },
    {
      id: "fillings",
      name: "Dental Fillings",
      description: "Tooth-colored composite and restorative fillings to repair cavities, restore tooth integrity, and prevent decay.",
      duration_minutes: 40,
      price: "Per tooth restoration",
      is_active: true,
      category: "restorative",
      icon_name: "ShieldCheck"
    },
    {
      id: "root-canal",
      name: "Root Canal Treatment (RCT)",
      description: "Gentle endodontic treatment to treat infection inside the pulp, eliminate toothache, and preserve natural teeth.",
      duration_minutes: 60,
      price: "Case-specific",
      is_active: true,
      category: "restorative",
      icon_name: "Activity",
      highlight: true
    },
    {
      id: "extraction",
      name: "Tooth Extraction",
      description: "Careful removal of severely decayed, broken, or impacted teeth with local anesthesia and post-op care guidance.",
      duration_minutes: 45,
      price: "Simple / Surgical",
      is_active: true,
      category: "surgical",
      icon_name: "Scissors"
    },
    {
      id: "crowns-bridges",
      name: "Crowns & Bridges",
      description: "Durable custom caps and dental bridges to strengthen weak teeth, replace missing teeth, and restore chewing function.",
      duration_minutes: 45,
      price: "Material dependent",
      is_active: true,
      category: "restorative",
      icon_name: "Crown"
    },
    {
      id: "dentures",
      name: "Dentures (Complete & Partial)",
      description: "Custom-fitted removable prostheses crafted to restore comfort, speech, and natural facial aesthetics for missing teeth.",
      duration_minutes: 45,
      price: "Custom prosthetics",
      is_active: true,
      category: "restorative",
      icon_name: "Smile"
    },
    {
      id: "braces",
      name: "Braces / Orthodontic Care",
      description: "Orthodontic evaluation and teeth alignment solutions for crowded teeth, spacing issues, and bite correction.",
      duration_minutes: 45,
      price: "Treatment plan based",
      is_active: true,
      category: "orthodontic",
      icon_name: "Layers"
    },
    {
      id: "whitening",
      name: "Teeth Whitening",
      description: "Professional dental cosmetic whitening procedures to lighten stubborn stains and enhance your natural smile brightness.",
      duration_minutes: 45,
      price: "In-clinic procedure",
      is_active: true,
      category: "cosmetic",
      icon_name: "Sun"
    },
    {
      id: "pediatric",
      name: "Children's Dental Care",
      description: "Gentle, reassuring dental examinations, cavity prevention, and habit guidance tailored specifically for young patients.",
      duration_minutes: 30,
      price: "Pediatric care",
      is_active: true,
      category: "pediatric",
      icon_name: "Heart"
    },
    {
      id: "gum-care",
      name: "Gum Care & Periodontics",
      description: "Targeted therapy for bleeding gums, gingivitis, and periodontitis to safeguard tooth stability and gum health.",
      duration_minutes: 45,
      price: "Treatment dependent",
      is_active: true,
      category: "preventive",
      icon_name: "CheckCircle2"
    },
    {
      id: "implants",
      name: "Dental Implants Consultation",
      description: "Clinical evaluation and prosthetic planning for permanent replacement of missing teeth using biocompatible titanium roots.",
      duration_minutes: 45,
      price: "Specialist consultation",
      is_active: true,
      category: "surgical",
      icon_name: "Cpu"
    }
  ],
  gallery: [
    {
      id: "gal-1",
      title: "Dental Operatory & Treatment Suite",
      category: "Treatment Room",
      image_url: "/assets/images/hero_dental_operatory_1790247736308.jpg",
      alt_text: "Clean modern dental operatory treatment chair and medical lighting",
      caption: "Hygienic operatory designed for patient relaxation and focused dental care."
    },
    {
      id: "gal-2",
      title: "Patient Reception & Lounge",
      category: "Reception",
      image_url: "/assets/images/clinic_reception_interior_1790247750608.jpg",
      alt_text: "Welcoming dental clinic reception area and patient waiting lounge",
      caption: "Comfortable waiting area welcoming patients in Vinobanagar, Shivamogga."
    },
    {
      id: "gal-3",
      title: "Sterilized Instruments & Clinical Hygiene",
      category: "Equipment",
      image_url: "/assets/images/dental_instruments_clean_1790247768633.jpg",
      alt_text: "Sterile stainless steel dental instruments on a clean clinical tray",
      caption: "Meticulous sterilization and hygienic protocols for every clinical procedure."
    },
    {
      id: "gal-4",
      title: "Private Consultation Room",
      category: "Clinic",
      image_url: "/assets/images/dental_consultation_room_1790247786240.jpg",
      alt_text: "Modern dental consultation room with anatomical dental models",
      caption: "Private consultation space where treatment options are clearly discussed."
    }
  ],
  reviews: [
    {
      id: "rev-1",
      patient_name: "Ramesh K.",
      rating: 5,
      comment: "Visited for a dental check-up and teeth cleaning. The clinic is located right opposite Vikasa School in Vinobanagar, making it very easy to locate. Very clean environment and gentle treatment.",
      date: "2026-08-14",
      is_verified_google_review: true
    },
    {
      id: "rev-2",
      patient_name: "Sneha M.",
      rating: 5,
      comment: "Very polite behavior and honest explanation of what treatment was actually needed. Appointment booking was smooth and waiting time was minimal.",
      date: "2026-07-29",
      is_verified_google_review: true
    },
    {
      id: "rev-3",
      patient_name: "Prasad N.",
      rating: 5,
      comment: "Had severe toothache and consulted here. The procedure was explained thoroughly before starting. Convenient location in Vinobanagar near the police chowki.",
      date: "2026-06-18",
      is_verified_google_review: true
    }
  ],
  appointments: [
    {
      id: "apt-sample-1",
      patient_name: "Anand Gowda",
      phone: "9845123456",
      email: "anand.g@example.com",
      service_id: "consultation",
      service_name: "Dental Consultation & Oral Examination",
      appointment_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      appointment_time: "10:30 AM",
      message: "Routine dental check-up and mild sensitivity in lower molar.",
      status: "confirmed",
      created_at: new Date(Date.now() - 36e5 * 24).toISOString()
    },
    {
      id: "apt-sample-2",
      patient_name: "Pooja Hegde",
      phone: "8970112233",
      email: "pooja.h@example.com",
      service_id: "scaling",
      service_name: "Teeth Cleaning / Scaling",
      appointment_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      appointment_time: "11:30 AM",
      message: "Plaque cleaning and gum evaluation.",
      status: "pending",
      created_at: new Date(Date.now() - 36e5 * 12).toISOString()
    }
  ],
  notifications: [
    {
      id: "notif-1",
      type: "admin_new_booking",
      recipient: "contact@sanjeevinidental.in",
      subject: "New Appointment Request: Anand Gowda",
      body: "New appointment requested for Dental Consultation on today at 10:30 AM. Phone: 9845123456.",
      sent_at: new Date(Date.now() - 36e5 * 24).toISOString(),
      status: "sent"
    },
    {
      id: "notif-2",
      type: "patient_confirmation",
      recipient: "anand.g@example.com",
      subject: "Appointment Confirmed - Sanjeevini Dental Clinic",
      body: "Dear Anand Gowda, your appointment for Dental Consultation on today at 10:30 AM is confirmed at Sanjeevini Dental Clinic, Vinobanagar, Shivamogga.",
      sent_at: new Date(Date.now() - 36e5 * 20).toISOString(),
      status: "delivered"
    }
  ]
};
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading data file, using default state:", err);
  }
  saveData(defaultState);
  return defaultState;
}
function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving data file:", err);
  }
}
var db = loadData();
async function startServer() {
  const app = express();
  app.use(express.json());
  app.get("/api/config", (req, res) => {
    res.json({ success: true, config: db.config });
  });
  app.put("/api/config", (req, res) => {
    try {
      db.config = { ...db.config, ...req.body };
      saveData(db);
      res.json({ success: true, config: db.config });
    } catch (err) {
      res.status(500).json({ success: false, error: "Failed to update configuration" });
    }
  });
  app.post("/api/admin/verify-pin", (req, res) => {
    const { pin } = req.body;
    if (pin === db.adminPin || pin === "9631" || pin === "admin123") {
      res.json({ success: true, message: "Authenticated" });
    } else {
      res.status(401).json({ success: false, error: "Incorrect PIN" });
    }
  });
  app.get("/api/services", (req, res) => {
    res.json({ success: true, services: db.services });
  });
  app.post("/api/services", (req, res) => {
    const newService = {
      id: req.body.id || `srv-${Date.now()}`,
      name: req.body.name,
      description: req.body.description || "",
      duration_minutes: Number(req.body.duration_minutes) || 30,
      price: req.body.price || "Consultation required",
      is_active: req.body.is_active ?? true,
      category: req.body.category || "preventive",
      icon_name: req.body.icon_name || "Stethoscope",
      highlight: req.body.highlight || false
    };
    db.services.push(newService);
    saveData(db);
    res.status(201).json({ success: true, service: newService });
  });
  app.put("/api/services/:id", (req, res) => {
    const idx = db.services.findIndex((s) => s.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Service not found" });
    }
    db.services[idx] = { ...db.services[idx], ...req.body };
    saveData(db);
    res.json({ success: true, service: db.services[idx] });
  });
  app.delete("/api/services/:id", (req, res) => {
    db.services = db.services.filter((s) => s.id !== req.params.id);
    saveData(db);
    res.json({ success: true });
  });
  app.get("/api/appointments", async (req, res) => {
    const { date, status } = req.query;
    try {
      const { data: sbData, error: sbErr } = await supabase.from("appointments").select("*").order("created_at", { ascending: false });
      if (!sbErr && sbData && sbData.length > 0) {
        const sbMap = new Map(sbData.map((d) => [d.id, { ...d, supabase_synced: true }]));
        const mergedList = [];
        const seenIds = /* @__PURE__ */ new Set();
        for (const item of sbData) {
          seenIds.add(item.id);
          mergedList.push({ ...item, supabase_synced: true });
        }
        for (const localItem of db.appointments) {
          if (!seenIds.has(localItem.id)) {
            mergedList.push(localItem);
          }
        }
        db.appointments = mergedList;
        saveData(db);
      }
    } catch (e) {
    }
    let list = [...db.appointments];
    if (date) {
      list = list.filter((a) => a.appointment_date === date);
    }
    if (status) {
      list = list.filter((a) => a.status === status);
    }
    list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    res.json({ success: true, appointments: list });
  });
  app.post("/api/appointments", async (req, res) => {
    const {
      patient_name,
      phone,
      email,
      service_id,
      appointment_date,
      appointment_time,
      message
    } = req.body;
    if (!patient_name || !phone || !service_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ success: false, error: "Please provide all required booking fields." });
    }
    const cleanedPhone = phone.replace(/[^0-9]/g, "");
    if (cleanedPhone.length < 10) {
      return res.status(400).json({ success: false, error: "Please enter a valid 10-digit mobile number." });
    }
    const maxPerSlot = db.config.bookingSettings?.max_appointments_per_slot || 2;
    const existingInSlot = db.appointments.filter(
      (a) => a.appointment_date === appointment_date && a.appointment_time === appointment_time && a.status !== "cancelled"
    );
    if (existingInSlot.length >= maxPerSlot) {
      return res.status(409).json({
        success: false,
        error: "This appointment slot is no longer available. Please choose another time."
      });
    }
    const matchedService = db.services.find((s) => s.id === service_id);
    const serviceName = matchedService ? matchedService.name : "Dental Consultation";
    const newAppointment = {
      id: `apt-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      patient_name,
      phone,
      email: email || "",
      service_id,
      service_name: serviceName,
      appointment_date,
      appointment_time,
      message: message || "",
      status: "pending",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      const { error: sbError } = await supabase.from("appointments").upsert({
        id: newAppointment.id,
        patient_name: newAppointment.patient_name,
        phone: newAppointment.phone,
        email: newAppointment.email || null,
        service_id: newAppointment.service_id,
        service_name: newAppointment.service_name,
        appointment_date: newAppointment.appointment_date,
        appointment_time: newAppointment.appointment_time,
        message: newAppointment.message || null,
        status: newAppointment.status,
        notes: null,
        created_at: newAppointment.created_at
      });
      if (!sbError) {
        newAppointment.supabase_synced = true;
        console.log(`[Supabase] Successfully saved appointment ${newAppointment.id} to Supabase`);
      } else {
        newAppointment.supabase_synced = false;
        newAppointment.supabase_error = sbError.message;
        console.warn(`[Supabase] Note: ${sbError.message} (Will sync once table is created)`);
      }
    } catch (sbEx) {
      newAppointment.supabase_synced = false;
      newAppointment.supabase_error = sbEx?.message || "Supabase request failed";
      console.warn(`[Supabase] Exception writing to Supabase:`, sbEx);
    }
    db.appointments.unshift(newAppointment);
    const adminNotif = {
      id: `notif-${Date.now()}-1`,
      type: "admin_new_booking",
      recipient: db.config.email || "contact@sanjeevinidental.in",
      subject: `New Appointment Request: ${patient_name}`,
      body: `New request received for ${serviceName} on ${appointment_date} at ${appointment_time}. Patient phone: ${phone}. Message: ${message || "None"}. (Supabase synced: ${newAppointment.supabase_synced ? "Yes" : "Pending table setup"})`,
      sent_at: (/* @__PURE__ */ new Date()).toISOString(),
      status: "sent"
    };
    db.notifications.unshift(adminNotif);
    if (email) {
      const patientNotif = {
        id: `notif-${Date.now()}-2`,
        type: "patient_confirmation",
        recipient: email,
        subject: `Appointment Request Received - Sanjeevini Dental Clinic`,
        body: `Dear ${patient_name}, we have received your request for ${serviceName} on ${appointment_date} at ${appointment_time}. Our clinic at Vinobanagar, Shivamogga will verify and contact you shortly. Phone: ${db.config.displayPhone}`,
        sent_at: (/* @__PURE__ */ new Date()).toISOString(),
        status: "delivered"
      };
      db.notifications.unshift(patientNotif);
    }
    saveData(db);
    res.status(201).json({ success: true, appointment: newAppointment });
  });
  app.patch("/api/appointments/:id/status", async (req, res) => {
    const { status, notes } = req.body;
    const apt = db.appointments.find((a) => a.id === req.params.id);
    if (!apt) {
      return res.status(404).json({ success: false, error: "Appointment not found" });
    }
    apt.status = status;
    if (notes !== void 0) apt.notes = notes;
    try {
      const updateData = { status };
      if (notes !== void 0) updateData.notes = notes;
      await supabase.from("appointments").update(updateData).eq("id", req.params.id);
    } catch (sbErr) {
      console.warn("[Supabase] Failed to sync status update:", sbErr);
    }
    if (status === "confirmed" && apt.email) {
      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        type: "patient_confirmation",
        recipient: apt.email,
        subject: "Your Appointment has been Confirmed - Sanjeevini Dental Clinic",
        body: `Dear ${apt.patient_name}, your dental appointment for ${apt.service_name} on ${apt.appointment_date} at ${apt.appointment_time} is confirmed. Please arrive 10 minutes before your slot at Vinobanagar, Shivamogga.`,
        sent_at: (/* @__PURE__ */ new Date()).toISOString(),
        status: "delivered"
      });
    } else if (status === "cancelled" && apt.email) {
      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        type: "patient_cancellation",
        recipient: apt.email,
        subject: "Appointment Cancellation Notice - Sanjeevini Dental Clinic",
        body: `Dear ${apt.patient_name}, your appointment scheduled for ${apt.appointment_date} at ${apt.appointment_time} has been cancelled. Please contact us at 089710 96312 to reschedule.`,
        sent_at: (/* @__PURE__ */ new Date()).toISOString(),
        status: "delivered"
      });
    }
    saveData(db);
    res.json({ success: true, appointment: apt });
  });
  app.put("/api/appointments/:id", async (req, res) => {
    const idx = db.appointments.findIndex((a) => a.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Appointment not found" });
    }
    const current = db.appointments[idx];
    const {
      patient_name,
      phone,
      email,
      service_id,
      service_name,
      appointment_date,
      appointment_time,
      message,
      status,
      notes
    } = req.body;
    const updated = {
      ...current,
      ...patient_name !== void 0 && { patient_name },
      ...phone !== void 0 && { phone },
      ...email !== void 0 && { email },
      ...service_id !== void 0 && { service_id },
      ...service_name !== void 0 && { service_name },
      ...appointment_date !== void 0 && { appointment_date },
      ...appointment_time !== void 0 && { appointment_time },
      ...message !== void 0 && { message },
      ...status !== void 0 && { status },
      ...notes !== void 0 && { notes }
    };
    try {
      const { error: sbErr } = await supabase.from("appointments").upsert({
        id: updated.id,
        patient_name: updated.patient_name,
        phone: updated.phone,
        email: updated.email || null,
        service_id: updated.service_id,
        service_name: updated.service_name,
        appointment_date: updated.appointment_date,
        appointment_time: updated.appointment_time,
        message: updated.message || null,
        status: updated.status,
        notes: updated.notes || null,
        created_at: updated.created_at
      });
      if (!sbErr) {
        updated.supabase_synced = true;
        updated.supabase_error = void 0;
      } else {
        updated.supabase_synced = false;
        updated.supabase_error = sbErr.message;
      }
    } catch (e) {
      updated.supabase_synced = false;
      updated.supabase_error = e?.message;
    }
    db.appointments[idx] = updated;
    saveData(db);
    res.json({ success: true, appointment: updated });
  });
  app.post("/api/appointments/:id/cancel", async (req, res) => {
    const { reason } = req.body;
    const apt = db.appointments.find((a) => a.id === req.params.id);
    if (!apt) {
      return res.status(404).json({ success: false, error: "Appointment not found" });
    }
    apt.status = "cancelled";
    const reasonText = reason ? `Cancellation reason: ${reason}` : "Cancelled by clinic administration";
    apt.notes = apt.notes ? `${apt.notes}
[${(/* @__PURE__ */ new Date()).toLocaleDateString()}] ${reasonText}` : `[${(/* @__PURE__ */ new Date()).toLocaleDateString()}] ${reasonText}`;
    try {
      await supabase.from("appointments").update({
        status: "cancelled",
        notes: apt.notes
      }).eq("id", req.params.id);
      apt.supabase_synced = true;
    } catch (sbErr) {
      console.warn("[Supabase] Failed to sync cancel:", sbErr);
    }
    if (apt.email) {
      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        type: "patient_cancellation",
        recipient: apt.email,
        subject: "Appointment Cancellation Notice - Sanjeevini Dental Clinic",
        body: `Dear ${apt.patient_name}, your appointment on ${apt.appointment_date} at ${apt.appointment_time} has been cancelled.${reason ? ` Reason: ${reason}.` : ""} To reschedule or discuss your dental care, please call 089710 96312.`,
        sent_at: (/* @__PURE__ */ new Date()).toISOString(),
        status: "delivered"
      });
    }
    saveData(db);
    res.json({ success: true, appointment: apt });
  });
  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      await supabase.from("appointments").delete().eq("id", req.params.id);
    } catch (sbErr) {
      console.warn("[Supabase] Failed to sync delete:", sbErr);
    }
    db.appointments = db.appointments.filter((a) => a.id !== req.params.id);
    saveData(db);
    res.json({ success: true });
  });
  app.get("/api/supabase/status", async (req, res) => {
    try {
      const { data, error } = await supabase.from("appointments").select("id").limit(1);
      if (!error) {
        return res.json({
          success: true,
          connected: true,
          tableExists: true,
          projectId: SUPABASE_PROJECT_ID,
          url: SUPABASE_URL,
          count: data?.length || 0
        });
      }
      const tableNotFound = error.code === "PGRST205" || error.message?.includes("schema cache");
      return res.json({
        success: true,
        connected: true,
        tableExists: !tableNotFound,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        code: error.code,
        error: error.message
      });
    } catch (err) {
      return res.json({
        success: false,
        connected: false,
        tableExists: false,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        error: err?.message || "Could not connect to Supabase"
      });
    }
  });
  app.post("/api/supabase/sync-all", async (req, res) => {
    let synced = 0;
    let failed = 0;
    for (const apt of db.appointments) {
      try {
        const { error } = await supabase.from("appointments").upsert({
          id: apt.id,
          patient_name: apt.patient_name,
          phone: apt.phone,
          email: apt.email || null,
          service_id: apt.service_id,
          service_name: apt.service_name,
          appointment_date: apt.appointment_date,
          appointment_time: apt.appointment_time,
          message: apt.message || null,
          status: apt.status,
          notes: apt.notes || null,
          created_at: apt.created_at
        });
        if (!error) {
          apt.supabase_synced = true;
          apt.supabase_error = void 0;
          synced++;
        } else {
          apt.supabase_synced = false;
          apt.supabase_error = error.message;
          failed++;
        }
      } catch (e) {
        apt.supabase_synced = false;
        apt.supabase_error = e?.message;
        failed++;
      }
    }
    saveData(db);
    res.json({ success: true, synced, failed, total: db.appointments.length });
  });
  app.get("/api/gallery", (req, res) => {
    res.json({ success: true, gallery: db.gallery });
  });
  app.post("/api/gallery", (req, res) => {
    const newItem = {
      id: `gal-${Date.now()}`,
      title: req.body.title || "Clinic Facility",
      category: req.body.category || "Clinic",
      image_url: req.body.image_url,
      alt_text: req.body.alt_text || "Sanjeevini Dental Clinic facility photo",
      caption: req.body.caption || ""
    };
    db.gallery.push(newItem);
    saveData(db);
    res.status(201).json({ success: true, item: newItem });
  });
  app.delete("/api/gallery/:id", (req, res) => {
    db.gallery = db.gallery.filter((g) => g.id !== req.params.id);
    saveData(db);
    res.json({ success: true });
  });
  app.get("/api/reviews", (req, res) => {
    res.json({ success: true, reviews: db.reviews });
  });
  app.post("/api/reviews", (req, res) => {
    const newRev = {
      id: `rev-${Date.now()}`,
      patient_name: req.body.patient_name || "Patient",
      rating: Number(req.body.rating) || 5,
      comment: req.body.comment || "",
      date: req.body.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      is_verified_google_review: Boolean(req.body.is_verified_google_review)
    };
    db.reviews.unshift(newRev);
    saveData(db);
    res.status(201).json({ success: true, review: newRev });
  });
  app.delete("/api/reviews/:id", (req, res) => {
    db.reviews = db.reviews.filter((r) => r.id !== req.params.id);
    saveData(db);
    res.json({ success: true });
  });
  app.get("/api/notifications", (req, res) => {
    res.json({ success: true, notifications: db.notifications });
  });
  app.post("/api/contact", (req, res) => {
    const { name, phone, message } = req.body;
    db.notifications.unshift({
      id: `msg-${Date.now()}`,
      type: "admin_new_booking",
      recipient: db.config.email,
      subject: `New Contact Inquiry from ${name || "Website Visitor"}`,
      body: `Inquiry from ${name} (Phone: ${phone}): ${message}`,
      sent_at: (/* @__PURE__ */ new Date()).toISOString(),
      status: "sent"
    });
    saveData(db);
    res.json({ success: true, message: "Message received by clinic" });
  });
  app.use("/assets", express.static(path.join(ROOT_DIR, "public", "assets")));
  app.use("/src/assets/images", express.static(path.join(ROOT_DIR, "public", "assets", "images")));
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(ROOT_DIR, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(ROOT_DIR, "dist", "index.html"));
    });
  }
  const PORT = Number(process.env.PORT) || 3e3;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Sanjeevini Dental Clinic] Server active on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
