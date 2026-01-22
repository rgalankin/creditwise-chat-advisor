import { useState, useEffect } from 'react';
import { useBlinkAuth } from '@blinkdotnew/react';
import { LandingPage } from './components/LandingPage';
import { ChatDashboard } from './components/ChatDashboard';
import { Spinner } from './components/ui/spinner';
import { blink } from './lib/blink';

const GUEST_SESSION_KEY = 'creditwise_guest_session';

export default function App() {
  // Temporarily simplified for debugging
  return (
    <div className="flex h-screen w-full items-center justify-center bg-blue-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">CreditWise App</h1>
        <p className="text-gray-600">App is loading...</p>
      </div>
    </div>
  );
}
