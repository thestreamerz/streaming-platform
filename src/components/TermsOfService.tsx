import React from 'react';
import { ArrowLeft, FileText, AlertTriangle, Shield, Users, Gavel } from 'lucide-react';

interface TermsOfServiceProps {
  onClose: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onClose }) => {
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
              <FileText className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
            </div>

            <div className="prose prose-invert max-w-none space-y-8">
              <div className="text-gray-300 text-sm mb-8">
                <p><strong>Last Updated:</strong> January 2025</p>
                <p><strong>Effective Date:</strong> January 2025</p>
              </div>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                <div className="text-gray-300 space-y-4">
                  <p>
                    By accessing and using THE STREAMERZ ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-semibold text-white">2. User Accounts</h2>
                </div>
                <div className="text-gray-300 space-y-4">
                  <p>To access certain features of our service, you may be required to create an account. You agree to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide accurate, current, and complete information during registration</li>
                    <li>Maintain and promptly update your account information</li>
                    <li>Maintain the security of your password and account</li>
                    <li>Accept responsibility for all activities under your account</li>
                    <li>Notify us immediately of any unauthorized use of your account</li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">3. Acceptable Use</h2>
                </div>
                <div className="text-gray-300 space-y-4">
                  <p>You agree not to use the service to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe upon the rights of others</li>
                    <li>Distribute malware, viruses, or other harmful code</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Interfere with or disrupt the service or servers</li>
                    <li>Use automated systems to access the service without permission</li>
                    <li>Share account credentials with others</li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white">4. Content and TMDB Compliance</h2>
                </div>
                <div className="text-gray-300 space-y-4">
                  <p>
                    Our service provides access to movie and TV show information through The Movie Database (TMDB) API. By using our service, you acknowledge that:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Movie and TV show data is provided by TMDB and subject to their terms of service</li>
                    <li>We comply with TMDB's attribution requirements and API usage guidelines</li>
                    <li>Content availability may change based on TMDB's database updates</li>
                    <li>We do not host or distribute copyrighted content directly</li>
                    <li>Streaming links are provided to third-party services and are subject to their terms</li>
                  </ul>
                  <p>
                    <strong>TMDB Attribution:</strong> This product uses the TMDB API but is not endorsed or certified by TMDB.
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-xl font-semibold text-white">5. Intellectual Property</h2>
                </div>
                <div className="text-gray-300 space-y-4">
                  <p>
                    The service and its original content, features, and functionality are and will remain the exclusive property of THE STREAMERZ and its licensors. The service is protected by copyright, trademark, and other laws.
                  </p>
                  <p>
                    Movie and TV show information, images, and metadata are provided by TMDB and remain the property of their respective owners.
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Gavel className="w-6 h-6 text-red-400" />
                  <h2 className="text-xl font-semibold text-white">6. Disclaimer of Warranties</h2>
                </div>
                <div className="text-gray-300 space-y-4">
                  <p>
                    The information on this service is provided on an "as is" basis. To the fullest extent permitted by law, THE STREAMERZ excludes all representations, warranties, conditions, and terms whether express or implied.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>We do not guarantee the accuracy or completeness of content information</li>
                    <li>Streaming availability may vary and is subject to third-party service terms</li>
                    <li>We are not responsible for the content or practices of linked third-party services</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
                <div className="text-gray-300 space-y-4">
                  <p>
                    In no event shall THE STREAMERZ, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">8. Termination</h2>
                <div className="text-gray-300 space-y-4">
                  <p>
                    We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
                  </p>
                  <p>
                    If you wish to terminate your account, you may simply discontinue using the service or contact us to delete your account.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">9. Governing Law</h2>
                <div className="text-gray-300 space-y-4">
                  <p>
                    These Terms shall be interpreted and governed by the laws of the jurisdiction in which THE STREAMERZ operates, without regard to its conflict of law provisions.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">10. Changes to Terms</h2>
                <div className="text-gray-300 space-y-4">
                  <p>
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
                <div className="text-gray-300 space-y-2">
                  <p>If you have any questions about these Terms of Service, please contact us:</p>
                  <p><strong>Email:</strong> support@thestreamerz.com</p>
                  <p><strong>Website:</strong> THE STREAMERZ</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};