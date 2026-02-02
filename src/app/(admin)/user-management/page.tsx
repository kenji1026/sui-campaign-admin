"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name?: string;
  email: string;
  image?: string;
  emailVerified?: string | null;
  role?: string;
  active?: boolean;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (id: string, data: Partial<User>) => {
    setSaving(id);
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      setUsers((users) =>
        users.map((u) => (u.id === id ? { ...u, ...data } : u))
      );
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setSaving(null);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading users...</div>
      </div>
    );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="border rounded bg-white p-4 shadow-sm">
        {users.length === 0 ? (
          <div className="text-gray-600 p-4 text-center">No users found</div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-500">
                  Name
                </th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">
                  Email
                </th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">
                  Role
                </th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">
                  Active
                </th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-3">{u.name ?? "-"}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <select
                      value={u.role ?? "user"}
                      disabled={saving === u.id}
                      onChange={(e) =>
                        handleUpdate(u.id, { role: e.target.value })
                      }
                      className="border rounded p-1 text-sm"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={u.active !== false}
                        disabled={saving === u.id}
                        onChange={(e) =>
                          handleUpdate(u.id, { active: e.target.checked })
                        }
                        className="rounded text-blue-600"
                      />
                    </label>
                  </td>
                  <td className="p-3">
                    {saving === u.id ? (
                      <span className="text-blue-600 text-sm">Saving...</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
