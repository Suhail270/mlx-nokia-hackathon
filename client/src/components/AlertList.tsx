import React from 'react';
import { AlertType } from '@/types/alerts';
import { Bell, Siren } from 'lucide-react';

interface AlertListProps {
  alerts: AlertType[];
  onAlertSelect: (alert: AlertType) => void;
}

const AlertList = ({ alerts, onAlertSelect }: AlertListProps) => {
  return (
    <div className="fixed left-0 top-2 h-[95%] w-80 bg-background flex flex-col">
      {/* Fixed header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Alerts</h2>
          <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-sm">
            {alerts.length} Active
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-4">
          {alerts.map((alert) => (
            <button
              key={alert.id}
              onClick={() => onAlertSelect(alert)}
              className="w-full bg-secondary p-4 rounded-lg hover:bg-secondary/80 transition-colors text-left"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full
                  ${alert.type === 'fire' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500' }`
                  }>
                  {alert.type === 'fire' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                  ) : (
                    <Siren className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium capitalize">{alert.type}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{alert.location}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertList;