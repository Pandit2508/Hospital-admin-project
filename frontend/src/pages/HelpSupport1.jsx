"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "../components/ui/card";
import { ChevronDown } from "lucide-react";

import { db } from "../firebase";
import { getDoc, doc } from "firebase/firestore";

export default function HelpSupport({ hospitalId }) {
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Dynamic Contact Info
  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "",
    hours: "24/7"
  });

  // FAQs (Static for now)
  const faqs = [
    {
      id: 1,
      question: "How do I update bed availability?",
      answer:
        "Go to Resource Management > Bed Management and update the occupied beds count. The available beds will automatically calculate."
    },
    {
      id: 2,
      question: "How do I refer a patient to another hospital?",
      answer:
        'Navigate to Hospital Network, find the hospital with available resources, and click "Refer Patient". Fill in the patient details and submit.'
    },
    {
      id: 3,
      question: "What does a critical alert mean?",
      answer:
        "Critical alerts indicate urgent situations such as low blood reserves or ICU shortage. Review them and take proper action."
    }
  ];

  // ------------------------------------------
  // LOAD CONTACT INFO FROM HOSPITAL DOCUMENT
  // ------------------------------------------
  useEffect(() => {
    const loadHospitalContact = async () => {
      const hid = hospitalId || localStorage.getItem("hospitalID");
      if (!hid) return;

      const ref = doc(db, "hospitals", hid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        setContactInfo({
          email: data.email || "Not provided",
          phone: data.contact || "Not provided",
          hours: "24/7"
        });
      }
    };

    loadHospitalContact();
  }, [hospitalId]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-1">Get help with using the dashboard</p>
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="border border-gray-200 rounded-lg bg-white"
            >
              <button
                onClick={() =>
                  setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                }
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900 text-left">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 transition-transform ${
                    expandedFaq === faq.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedFaq === faq.id && (
                <div className="px-4 py-3 bg-gray-50 text-gray-700 border-t border-gray-200">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dynamic Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-gray-700">
          <div>
            <p className="text-sm font-medium">Email Support</p>
            <p>{contactInfo.email}</p>
          </div>

          <div>
            <p className="text-sm font-medium">Phone Support</p>
            <p>{contactInfo.phone}</p>
          </div>

          <div>
            <p className="text-sm font-medium">Support Hours</p>
            <p>{contactInfo.hours}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
