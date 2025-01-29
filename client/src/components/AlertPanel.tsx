import React from 'react';
import { AlertType } from '@/types/alerts';
import { X } from 'lucide-react';

interface AlertPanelProps {
  alert: AlertType | null;
  onClose: () => void;
}

const AlertPanel = ({ alert, onClose }: AlertPanelProps) => {
  if (!alert) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border p-6 shadow-xl overflow-y-auto panel-slide">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Alert Details</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-secondary rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Type</h3>
          <p className="text-lg capitalize">{alert.type}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Location</h3>
          <p className="text-lg">{alert.location}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
            ${alert.severity === 'critical' ? 'bg-red-500/20 text-red-500' :
              alert.severity === 'warning' ? 'bg-orange-500/20 text-orange-500' :
                'bg-blue-500/20 text-blue-500'
            }`}>
            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
          </span>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Timestamp</h3>
          <p className="text-lg">{new Date(alert.timestamp).toLocaleString()}</p>
        </div>

        {alert.image && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Snapshot</h3>
            <img
              src={alert.image}
              alt="Alert snapshot"
              className="w-full rounded-lg"
            />
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
          <p className="text-sm text-muted-foreground">{alert.description}</p>
        </div>

        <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg transition-colors">
          Mark as Resolved
        </button>
      </div>
    </div>
  );
};

export default AlertPanel;