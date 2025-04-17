"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Github, Linkedin } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Contact = () => {
  const [formData, setFormData] = useState({ email: "", message: "" });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) {
      toast.error("Please fill in both email and message.", { duration: 5000 });
      return;
    }

    const mailtoLink = `mailto:subhamsingh39621@gmail.com?subject=Contact%20Form%20Submission&body=From: ${encodeURIComponent(
      formData.email
    )}%0A%0AMessage: ${encodeURIComponent(formData.message)}`;

    window.location.href = mailtoLink;

    setFormData({ email: "", message: "" });
    toast.success("Opening your email client...", { duration: 5000 });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="bg-black border-gray-800 shadow-xl shadow-gray-900/60">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">
              Get in Touch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              If you encounter any problems, please contact me at{" "}
              <a
                href="mailto:subhamsingh39621@gmail.com"
                className="text-white hover:text-gray-300 transition-colors"
              >
                subhamsingh39621@gmail.com
              </a>.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Linkedin className="h-5 w-5 text-white" />
                <a
                  href="https://www.linkedin.com/in/subham-singh-ab1734270/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  Subham Singh - LinkedIn
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Github className="h-5 w-5 text-white" />
                <a
                  href="https://github.com/SUBHAM-6291"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  SUBHAM-6291 - GitHub
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-gray-800 shadow-xl shadow-gray-900/60">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">
              Contact the Developer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white text-sm font-medium">
                  Your Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus:border-white/70 focus:ring-2 focus:ring-white/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-white text-sm font-medium">
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Enter your message"
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus:border-white/70 focus:ring-2 focus:ring-white/30"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-white text-black font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-300"
              >
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;