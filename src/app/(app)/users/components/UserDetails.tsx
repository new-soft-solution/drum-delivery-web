"use client";

import DetailRow from "@/components/ui/DetailRow/DetailRow";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import { User } from "@/types/user.type";
import { formatDateNL } from "@/utils/dateFormatter";
import React from "react";

export const UserDetails: React.FC<{ user: User }> = ({ user }) => {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");

  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">User Information</h4>
        <div className="row">
          <div className="col-md-6">
            <DetailRow
              label="Username"
              value={user.username || "—"}
              icon="ri-user-line"
            />
            <DetailRow
              label="Full Name"
              value={fullName || "—"}
              icon="ri-id-card-line"
            />
            <DetailRow
              label="Email"
              value={user.email || "—"}
              icon="ri-mail-line"
            />
            <DetailRow
              label="Role"
              value={user.role || "—"}
              icon="ri-shield-user-line"
            />
          </div>
          <div className="col-md-6">
            <DetailRow
              label="Status"
              value={
                <StatusBadge status={user.is_active ? "Active" : "Inactive"} />
              }
              icon="ri-radar-line"
            />
            <DetailRow
              label="Staff Access"
              value={<StatusBadge status={user.is_staff ? "Yes" : "No"} />}
              icon="ri-admin-line"
            />
            <DetailRow
              label="Date Joined"
              value={formatDateNL(user.date_joined)}
              icon="ri-calendar-line"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
