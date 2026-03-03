package com.agropecuariopos.backend.events;

import com.agropecuariopos.backend.dto.alerts.EODReportAlert;
import org.springframework.context.ApplicationEvent;

public class EndOfDayReportEvent extends ApplicationEvent {

    private final EODReportAlert reportAlert;

    public EndOfDayReportEvent(Object source, EODReportAlert reportAlert) {
        super(source);
        this.reportAlert = reportAlert;
    }

    public EODReportAlert getReportAlert() {
        return reportAlert;
    }
}
