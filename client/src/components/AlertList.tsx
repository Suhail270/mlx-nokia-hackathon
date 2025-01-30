import React from 'react';
import { AlertType } from '@/types/alerts';
import { Bell } from 'lucide-react';

interface AlertListProps {
  alerts: AlertType[];
  onAlertSelect: (alert: AlertType) => void;
}

const AlertList = ({ alerts, onAlertSelect }: AlertListProps) => {
  return (
    <div className="fixed left-0 top-0 h-full w-80 bg-background border-r border-border overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Alerts</h2>
          <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-sm">
            {alerts.length} Active
          </span>
        </div>

        <div className="space-y-4">
          {alerts.map((alert) => (
            <button
              key={alert.id}
              onClick={() => onAlertSelect(alert)}
              className="w-full bg-secondary p-4 rounded-lg hover:bg-secondary/80 transition-colors text-left"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full
                  ${alert.severity === 'critical' ? 'bg-red-500/20 text-red-500' :
                    alert.severity === 'warning' ? 'bg-orange-500/20 text-orange-500' :
                      'bg-blue-500/20 text-blue-500'
                  }`}>
                  <Bell className="w-4 h-4" />
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