import React from 'react';
import { AlertType } from '@/types/alerts';
import { UserRoundX, Siren } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface AlertListProps {
  alerts: AlertType[];
  onAlertSelect: (alert: AlertType) => void;
}

const AlertList = ({ alerts, onAlertSelect }: AlertListProps) => {
  const getStatusClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'bg-green-600/20 hover:bg-green-600/20 text-green-500 hover:text-green-500 capitalize'
      case 'in progress':
        return 'bg-yellow-600/20 hover:bg-yellow-600/20 text-yellow-500 hover:text-yellow-500 capitalize'
      default:
        return 'bg-red-600/20 hover:bg-red-600/20 text-red-500 hover:text-red-500 capitalize'
    }
  }

  const groupedAlerts = {
    unresolved: alerts.filter(alert => 
      alert.status.toLowerCase() !== 'resolved' && 
      alert.status.toLowerCase() !== 'in progress'
    ),
    inProgress: alerts.filter(alert => 
      alert.status.toLowerCase() === 'in progress'
    ),
    resolved: alerts.filter(alert => 
      alert.status.toLowerCase() === 'resolved'
    ),
  };

  const renderAlertGroup = (groupAlerts: AlertType[]) => {
    if (groupAlerts.length === 0) return null;

    return (
      <div className="space-y-4">
        {groupAlerts.map((alert) => (
          <button
            key={alert.id}
            onClick={() => onAlertSelect(alert)}
            className="w-full bg-secondary p-4 rounded-lg hover:bg-secondary/80 transition-colors text-left"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full
                ${alert.type === 'fire' || alert.type === 'نار' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500' }`
              }>
                {alert.type === 'fire' || alert.type === 'نار' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                ) : (
                  <UserRoundX className="w-4 h-4" />
                )}
              </div>

              <div className='w-full'>
                <div className='flex justify-between'>
                  <div>
                    <h3 className="font-medium capitalize">{alert.type}</h3>
                  </div>
                  <div className='pr-2'>
                    <p className={`px-2 py-0.5 rounded-full text-sm ${getStatusClasses(alert.status)}`}>
                      {alert.status}
                    </p>
                  </div>
                </div>                                   
                <p className="text-sm text-muted-foreground mt-1">{alert.location}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  };
  
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
        <Accordion type="multiple" defaultValue={["unresolved", "inProgress"]} className="px-6">
          {groupedAlerts.unresolved.length > 0 && (
            <AccordionItem value="unresolved" className="border-b">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Unresolved</span>
                  <span className="bg-red-600/20 text-red-500 px-2 py-0.5 rounded-full text-xs">
                    {groupedAlerts.unresolved.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {renderAlertGroup(groupedAlerts.unresolved)}
              </AccordionContent>
            </AccordionItem>
          )}

          {groupedAlerts.inProgress.length > 0 && (
            <AccordionItem value="inProgress" className="border-b">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="font-medium">In Progress</span>
                  <span className="bg-yellow-600/20 text-yellow-500 px-2 py-0.5 rounded-full text-xs">
                    {groupedAlerts.inProgress.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {renderAlertGroup(groupedAlerts.inProgress)}
              </AccordionContent>
            </AccordionItem>
          )}

          {groupedAlerts.resolved.length > 0 && (
            <AccordionItem value="resolved" className="border-b">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Resolved</span>
                  <span className="bg-green-600/20 text-green-500 px-2 py-0.5 rounded-full text-xs">
                    {groupedAlerts.resolved.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {renderAlertGroup(groupedAlerts.resolved)}
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </div>
  );
};

export default AlertList;