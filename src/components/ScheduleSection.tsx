"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, DateSelectArg } from "@fullcalendar/core";
import { ScheduleEvent } from "./types";

interface EventDialogData {
  id?: string;
  eventName: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  description: string;
}

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [eventData, setEventData] = useState<EventDialogData>({
    eventName: "",
    startTime: null,
    endTime: null,
    description: "",
  });

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setIsEditMode(false);
    setEventData({
      eventName: "",
      startTime: dayjs(selectInfo.start),
      endTime: dayjs(selectInfo.end),
      description: "",
    });
    setDialogOpen(true);
    selectInfo.view.calendar.unselect();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = scheduleEvents.find((e) => e.id === clickInfo.event.id);
    setIsEditMode(true);
    setEventData({
      id: clickInfo.event.id,
      eventName: clickInfo.event.title,
      startTime: clickInfo.event.start ? dayjs(clickInfo.event.start) : null,
      endTime: clickInfo.event.end ? dayjs(clickInfo.event.end) : null,
      description: event?.description || "",
    });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEventData({
      eventName: "",
      startTime: null,
      endTime: null,
      description: "",
    });
  };

  const handleSaveEvent = () => {
    if (!eventData.eventName || !eventData.startTime || !eventData.endTime) {
      return;
    }

    const newEvent: ScheduleEvent = {
      id: eventData.id || String(Date.now()),
      title: eventData.eventName,
      start: eventData.startTime.format("YYYY-MM-DDTHH:mm:ss"),
      end: eventData.endTime.format("YYYY-MM-DDTHH:mm:ss"),
      description: eventData.description,
    };

    if (isEditMode && eventData.id) {
      onEventUpdate(newEvent);
    } else {
      onEventAdd(newEvent);
    }

    handleDialogClose();
  };

  const handleDeleteEvent = () => {
    if (eventData.id) {
      onEventDelete(eventData.id);
      handleDialogClose();
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

      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? "Edit Event" : "Add Event"}</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Event Name"
                fullWidth
                value={eventData.eventName}
                onChange={(e) =>
                  setEventData({ ...eventData, eventName: e.target.value })
                }
              />
              <TimePicker
                label="Start Time"
                value={eventData.startTime}
                onChange={(newValue) =>
                  setEventData({ ...eventData, startTime: newValue })
                }
              />
              <TimePicker
                label="End Time"
                value={eventData.endTime}
                onChange={(newValue) =>
                  setEventData({ ...eventData, endTime: newValue })
                }
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={eventData.description}
                onChange={(e) =>
                  setEventData({ ...eventData, description: e.target.value })
                }
              />
            </Stack>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          {isEditMode && (
            <Button onClick={handleDeleteEvent} color="error">
              Delete
            </Button>
          )}
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleSaveEvent}
            variant="contained"
            disabled={!eventData.eventName || !eventData.startTime || !eventData.endTime}
          >
            {isEditMode ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScheduleSection;
