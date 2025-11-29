"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, DateSelectArg } from "@fullcalendar/core";
import { ScheduleEvent } from "./types";

interface ScheduleSectionProps {
  scheduleEvents: ScheduleEvent[];
  currentDate: string;
  onEventAdd: (event: ScheduleEvent) => void;
  onEventUpdate: (event: ScheduleEvent) => void;
  onEventDelete: (eventId: string) => void;
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  scheduleEvents,
  currentDate,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
}) => {
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const title = prompt("Enter event title:");
    if (title) {
      const newEvent: ScheduleEvent = {
        id: String(Date.now()),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
      };
      onEventAdd(newEvent);
    }
    selectInfo.view.calendar.unselect();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const action = prompt(
      `Event: "${clickInfo.event.title}"\nType "delete" to remove, or enter new title to rename:`
    );
    if (action === "delete") {
      onEventDelete(clickInfo.event.id);
    } else if (action && action !== "") {
      onEventUpdate({
        id: clickInfo.event.id,
        title: action,
        start: clickInfo.event.startStr,
        end: clickInfo.event.endStr,
      });
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Schedule
      </Typography>
      <Box sx={{ height: 800 }}>
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridDay"
          initialDate={currentDate}
          headerToolbar={false}
          slotMinTime="03:00:00"
          slotMaxTime="23:00:00"
          allDaySlot={false}
          selectable={true}
          selectMirror={true}
          editable={true}
          events={scheduleEvents}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="100%"
        />
      </Box>
    </Box>
  );
};

export default ScheduleSection;
