import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth, unauthorizedResponse, canAccessSchool, forbiddenResponse } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import Enquiry from "@/lib/models/Enquiry";
import User from "@/lib/models/User";
import School from "@/lib/models/School";
import { sendMail, isEmailConfigured } from "@/lib/email";

// POST /api/enquiries/send-to-sales — send enquiry data to sales person via email (single or bulk)
export async function POST(request: NextRequest) {
  try {
    const payload = requireAuth(request, ["superadmin", "school_admin"]);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const { enquiryId, enquiryIds, id, ids, salesUserId } = body;

    const resolvedIds: string[] = ids || enquiryIds || (id ? [id] : enquiryId ? [enquiryId] : []);
    if (resolvedIds.length === 0) return errorResponse("Enquiry ID(s) required");
    if (!salesUserId) return errorResponse("Sales person ID is required");

    await connectDB();

    const salesUser = await User.findById(salesUserId).select("name email role isActive schoolId");
    if (!salesUser || salesUser.role !== "sales" || !salesUser.isActive) {
      return errorResponse("Sales person not found or inactive", 404);
    }
    if (payload.role === "school_admin") {
      const salesSchoolId = salesUser.schoolId?.toString();
      if (!salesSchoolId || salesSchoolId !== payload.schoolId) {
        return errorResponse("Sales person not found or inactive", 404);
      }
    }

    const enquiries = await Enquiry.find({ _id: { $in: resolvedIds } });
    if (enquiries.length === 0) return errorResponse("No enquiries found", 404);

    for (const enquiry of enquiries) {
      if (!canAccessSchool(payload, enquiry.schoolId.toString())) {
        return forbiddenResponse();
      }
    }

    const schoolIds = Array.from(new Set(enquiries.map(e => e.schoolId.toString())));
    const schools = await School.find({ _id: { $in: schoolIds } }).select("name slug");
    const schoolMap = new Map(schools.map(s => [s._id.toString(), s.name]));

    let html: string;
    let subject: string;

    if (enquiries.length === 1) {
      const enquiry = enquiries[0];
      const schoolName = schoolMap.get(enquiry.schoolId.toString()) || "Unknown School";
      subject = `New Enquiry Lead: ${enquiry.name} — ${schoolName}`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px;">New Enquiry Lead Assigned</h2>
          <div style="background: #f5f3ff; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; color: #5b21b6; font-weight: bold;">Lead Source: ${schoolName}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280; width: 140px;">Name</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${enquiry.name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Phone</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><a href="tel:${enquiry.phone}">${enquiry.phone}</a></td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Email</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${enquiry.email}">${enquiry.email}</a></td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Subject</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${enquiry.subject}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Message</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${enquiry.message}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Status</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${enquiry.status}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Received On</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${new Date(enquiry.createdAt).toLocaleString()}</td></tr>
          </table>
        </div>
      `;
    } else {
      subject = `${enquiries.length} Enquiry Leads Assigned`;
      const rows = enquiries.map(e => {
        const school = schoolMap.get(e.schoolId.toString()) || "Unknown";
        return `<tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${e.name}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><a href="tel:${e.phone}">${e.phone}</a></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${e.email}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${e.subject}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${school}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${e.status}</td>
        </tr>`;
      }).join("");
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px;">${enquiries.length} Enquiry Leads Assigned</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px;">
            <thead><tr style="background: #f9fafb;">
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Name</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Phone</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Email</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Subject</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">School</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Status</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }

    await Enquiry.updateMany(
      { _id: { $in: resolvedIds } },
      { sentToSales: true, sentToSalesAt: new Date(), sentToSalesBy: payload.userId, salesPersonId: salesUserId }
    );

    let emailSent = false;
    let emailWarning: string | undefined;
    if (isEmailConfigured()) {
      try {
        await sendMail({ to: salesUser.email, subject, html });
        emailSent = true;
      } catch (emailError) {
        console.error("Send enquiry to sales email error:", emailError);
        emailWarning = "Leads assigned in portal but email notification failed. Check SMTP settings.";
      }
    } else {
      emailWarning = "Leads assigned in portal. SMTP is not configured — no email sent.";
    }

    return successResponse({
      message: `${enquiries.length} enquiry lead(s) assigned to ${salesUser.name}${emailSent ? ` (${salesUser.email})` : ""}`,
      emailSent,
      emailWarning,
    });
  } catch (error) {
    console.error("Send enquiry to sales error:", error);
    return errorResponse("Failed to assign leads to sales.", 500);
  }
}
