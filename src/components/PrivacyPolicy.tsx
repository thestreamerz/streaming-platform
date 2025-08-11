import React from 'react';
import { ArrowLeft, Shield, Eye, Database, Cookie, Mail } from 'lucide-react';

interface PrivacyPolicyProps {
  onClose: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-full bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-8">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Site</span>
            </button>
          </div>

          <div className="bg-slate-800 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-8">
              <Shield className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
            </div>

            <div className="prose prose-invert max-w-none space-y-8">
              <div className="text-gray-300 text-sm mb-8">
                <p><strong>Last Updated:</strong> January 2025</p>
                <p><strong>Effective Date:</strong> January 2025</p>
              </div>

              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Eye className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">Information We Collect</h2>
                </div>
                <div className="text-gray-300 space-y-4">
                  <p>
                    THE STREAMERZ collects information to provide better services to our users. We collect information in the following ways:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Account Information:</strong> When you create an account, we collect your email address, display name, and authentication data.</li>
                    <li><strong>Usage Data:</strong> We collect information about how you use our service, including movies and shows you watch, search queries, and viewing preferences.</li>
                    <li><strong>Device Information:</strong> We collect device-specific information such as your browser type, operating system, and IP address.</li>
                    <li><strong>TMDB Data:</strong> Movie and TV show information is provided by The Movie Database (TMDB). We comply with TMDB's terms of service and attribution requirements.</li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Database className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-semibold text-white">How We Use Your Information</h2>
                </div>
                <div className="text-gray-300 space-y-4">
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide, maintain, and improve our streaming services</li>
                    <li>Personalize your experience and provide content recommendations</li>
                    <li>Communicate with you about service updates and new features</li>
                    <li>Ensure the security and integrity of our platform</li>
                    <li>Comply with legal obligations and enforce our terms of service</li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Cookie className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-xl font-semibold text-white">Cookies and Tracking</h2>
                </div>
                <div className="text-gray-300 space-y-4">
                  <p>
                    We use cookies and similar tracking technologies to enhance your experience on our platform. These technologies help us:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Remember your preferences and settings</li>
                    <li>Keep you signed in to your account</li>
                    <li>Analyze how our service is used to improve functionality</li>
                    <li>Provide personalized content recommendations</li>
                  </ul>
                  <p>
                    You can control cookie settings through your browser preferences, but disabling cookies may affect the functionality of our service.
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white">Data Security</h2>
                </div>
                <div className="text-gray-300 space-y-4">
                  <p>
                    We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Regular security audits and updates</li>
                    <li>Access controls and authentication measures</li>
                    <li>Secure hosting infrastructure with Firebase/Google Cloud</li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Eye className="w-6 h-6 text-red-400" />
                  <h2 className="text-xl font-semibold text-white">Third-Party Services</h2>
                </div>
                <div className="text-gray-300 space-y-4">
                  <p>Our service integrates with the following third-party services:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>The Movie Database (TMDB):</strong> We use TMDB's API to provide movie and TV show information. This usage complies with TMDB's terms of service and includes proper attribution.</li>
                    <li><strong>Google Firebase:</strong> For authentication and data storage services.</li>
                    <li><strong>Streaming Sources:</strong> We provide links to third-party streaming services. We are not responsible for the privacy practices of these external services.</li>
                  </ul>
                  <p>
                    <strong>TMDB Attribution:</strong> This product uses the TMDB API but is not endorsed or certified by TMDB. Movie and TV show data is provided by The Movie Database (TMDB).
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Mail className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-xl font-semibold text-white">Your Rights</h2>
                </div>
                <div className="text-gray-300 space-y-4">
                  <p>You have the right to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Access and review your personal information</li>
                    <li>Request correction of inaccurate data</li>
                    <li>Request deletion of your account and associated data</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Export your data in a portable format</li>
                  </ul>
                  <p>
                    To exercise these rights, please contact us at support@thestreamerz.com.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
                <div className="text-gray-300 space-y-2">
                  <p>If you have any questions about this Privacy Policy, please contact us:</p>
                  <p><strong>Email:</strong> support@thestreamerz.com</p>
                  <p><strong>Website:</strong> THE STREAMERZ</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Changes to This Policy</h2>
                <div className="text-gray-300">
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};