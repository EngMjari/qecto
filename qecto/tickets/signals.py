from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import TicketMessage, TicketSession

@receiver(post_save, sender=TicketMessage)
def update_ticket_session_reply_status(sender, instance, created, **kwargs):
    if not created:
        return  # فقط برای پیام‌های جدید

    session = instance.session

    if instance.sender_admin:
        session.reply_status = 'answered'
        session.last_message_by = 'admin'
    elif instance.sender_user:
        session.reply_status = 'waiting_for_admin'
        session.last_message_by = 'user'

    session.save(update_fields=['reply_status', 'last_message_by', 'updated_at'])
