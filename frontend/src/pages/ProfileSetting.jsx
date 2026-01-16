"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"

export default function ProfileSettings({ adminData }) {
  const [formData, setFormData] = useState({
    hospitalName: adminData?.hospitalName || "",
    adminName: adminData?.adminName || "",
    email: adminData?.email || "",
    phone: adminData?.phone || "",
    address: "123 Medical Street, Healthcare City",
    city: "New York",
    state: "NY",
    zipCode: "10001",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [saved, setSaved] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your hospital and admin account information</p>
      </div>

      {saved && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Profile updated successfully!
        </div>
      )}

      {/* Hospital Information */}
      <Card>
        <CardHeader>
          <CardTitle>Hospital Information</CardTitle>
          <CardDescription>Update your hospital details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
              <Input name="hospitalName" value={formData.hospitalName} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <Input name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <Input name="city" value={formData.city} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <Input name="state" value={formData.state} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
              <Input name="zipCode" value={formData.zipCode} onChange={handleChange} />
            </div>
          </div>
          <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
            Save Hospital Information
          </Button>
        </CardContent>
      </Card>

      {/* Admin Information */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Information</CardTitle>
          <CardDescription>Update your admin profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
            <Input name="adminName" value={formData.adminName} onChange={handleChange} />
          </div>
          <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
            Save Admin Information
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your login password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <Input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <Input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <Input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">Update Password</Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Critical Alerts</label>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Referral Notifications</label>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Resource Alerts</label>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">Save Preferences</Button>
        </CardContent>
      </Card>
    </div>
  )
}
