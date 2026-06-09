import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth, unauthorizedResponse, canAccessSchool, forbiddenResponse } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import Admission from "@/lib/models/Admission";
import User from "@/lib/models/User";
import School from "@/lib/models/School";
import { sendMail, isEmailConfigured } from "@/lib/email";

// POST /api/admissions/send-to-sales — send admission data to sales person via email (single or bulk)
export async function POST(request: NextRequest) {
  try {
    const payload = requireAuth(request, ["superadmin", "school_admin"]);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const { admissionId, admissionIds, id, ids, salesUserId } = body;

    // Support single/bulk: id/ids (new), admissionId/admissionIds (legacy)
    const resolvedIds: string[] = ids || admissionIds || (id ? [id] : admissionId ? [admissionId] : []);
    if (resolvedIds.length === 0) return errorResponse("Admission ID(s) required");
    if (!salesUserId) return errorResponse("Sales person ID is required");

    await connectDB();

    // Get the sales user
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

    // Get all admissions
    const admissions = await Admission.find({ _id: { $in: resolvedIds } });
    if (admissions.length === 0) return errorResponse("No admissions found", 404);

    // Permission check
    for (const admission of admissions) {
      if (!canAccessSchool(payload, admission.schoolId.toString())) {
        return forbiddenResponse();
      }
    }

    // Get school names for all unique school IDs
    const schoolIds = Array.from(new Set(admissions.map(a => a.schoolId.toString())));
    const schools = await School.find({ _id: { $in: schoolIds } }).select("name slug");
    const schoolMap = new Map(schools.map(s => [s._id.toString(), s.name]));

    // Build email - if single, detailed; if bulk, summary table
    let html: string;
    let subject: string;

    if (admissions.length === 1) {
      const admission = admissions[0];
      const schoolName = schoolMap.get(admission.schoolId.toString()) || "Unknown School";
      subject = `New Admission Lead: ${admission.studentName} — ${schoolName}`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #10b981; padding-bottom: 10px;">New Admission Lead Assigned</h2>
          <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; color: #065f46; font-weight: bold;">Lead Source: ${schoolName}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280; width: 140px;">Student Name</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${admission.studentName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Parent Name</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${admission.parentName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Phone</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><a href="tel:${admission.phone}">${admission.phone}</a></td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Email</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${admission.email}">${admission.email}</a></td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Class</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${admission.class}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">DOB</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${new Date(admission.dob).toLocaleDateString()}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Gender</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${admission.gender}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Address</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${admission.address}</td></tr>
            ${admission.previousSchool ? `<tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Previous School</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${admission.previousSchool}</td></tr>` : ""}
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Status</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${admission.status}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Applied On</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${new Date(admission.appliedAt || admission.createdAt).toLocaleString()}</td></tr>
          </table>
        </div>
      `;
    } else {
      subject = `${admissions.length} Admission Leads Assigned`;
      const rows = admissions.map(a => {
        const school = schoolMap.get(a.schoolId.toString()) || "Unknown";
        return `<tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${a.studentName}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${a.parentName}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><a href="tel:${a.phone}">${a.phone}</a></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${a.email}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${a.class}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${school}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${a.status}</td>
        </tr>`;
      }).join("");
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #10b981; padding-bottom: 10px;">${admissions.length} Admission Leads Assigned</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px;">
            <thead><tr style="background: #f9fafb;">
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Student</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Parent</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Phone</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Email</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Class</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">School</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Status</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }

    await Admission.updateMany(
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
        console.error("Send to sales email error:", emailError);
        emailWarning = "Leads assigned in portal but email notification failed. Check SMTP settings.";
      }
    } else {
      emailWarning = "Leads assigned in portal. SMTP is not configured — no email sent.";
    }

    return successResponse({
      message: `${admissions.length} lead(s) assigned to ${salesUser.name}${emailSent ? ` (${salesUser.email})` : ""}`,
      emailSent,
      emailWarning,
    });
  } catch (error) {
    console.error("Send to sales error:", error);
    return errorResponse("Failed to assign leads to sales.", 500);
  }
}
