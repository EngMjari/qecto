from django.contrib import admin
from .models import (
  TicketSession,
  TicketMessage,
  TicketMessageFile,
)


admin.site.register(TicketSession)
admin.site.register(TicketMessage)
admin.site.register(TicketMessageFile)
