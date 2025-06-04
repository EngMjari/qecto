from django.contrib import admin
from .models import (
  Ticket,
  TicketAttachment,
  TicketReply,
  TicketReplyAttachment,
)


admin.site.register(Ticket)
admin.site.register(TicketAttachment)
admin.site.register(TicketReply)
admin.site.register(TicketReplyAttachment)
