package com.reactnativeqrcodegenerator

import android.content.Intent
import android.provider.ContactsContract
import com.facebook.react.bridge.*
import android.content.ContentValues
import android.provider.CalendarContract
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class ContactModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "ContactModule"
  }

  @ReactMethod
  fun openContactForm(
    name: String?,
    phone: String?,
    email: String?,
    title: String?,
    company: String?,
    website: String?
  ) {
    val intent = Intent(Intent.ACTION_INSERT).apply {
      type = ContactsContract.Contacts.CONTENT_TYPE

      putExtra(ContactsContract.Intents.Insert.NAME, name)

      putExtra(ContactsContract.Intents.Insert.PHONE, phone)
      putExtra(ContactsContract.Intents.Insert.PHONE_TYPE, ContactsContract.CommonDataKinds.Phone.TYPE_WORK)

      putExtra(ContactsContract.Intents.Insert.EMAIL, email)
      putExtra(ContactsContract.Intents.Insert.EMAIL_TYPE, ContactsContract.CommonDataKinds.Email.TYPE_WORK)

      putExtra(ContactsContract.Intents.Insert.JOB_TITLE, title)
      putExtra(ContactsContract.Intents.Insert.COMPANY, company)

      val dataList = ArrayList<ContentValues>()
        if (!website.isNullOrEmpty()) {
            val websiteRow = ContentValues().apply {
                put(ContactsContract.Data.MIMETYPE, ContactsContract.CommonDataKinds.Website.CONTENT_ITEM_TYPE)
                put(ContactsContract.CommonDataKinds.Website.URL, website)
                put(ContactsContract.CommonDataKinds.Website.TYPE, ContactsContract.CommonDataKinds.Website.TYPE_WORK)
            }
            dataList.add(websiteRow)
        }
        putParcelableArrayListExtra(ContactsContract.Intents.Insert.DATA, dataList)

      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }

    reactApplicationContext.startActivity(intent)
  }

  @ReactMethod
  fun openEventForm(
      title: String,
      location: String,
      start: String,
      end: String,
      notes: String
  ) {
      try {
          val intent = Intent(Intent.ACTION_INSERT).apply {
              data = CalendarContract.Events.CONTENT_URI

              putExtra(CalendarContract.Events.TITLE, title)
              putExtra(CalendarContract.Events.EVENT_LOCATION, location)
              putExtra(CalendarContract.Events.DESCRIPTION, notes)

              putExtra(
                  CalendarContract.EXTRA_EVENT_BEGIN_TIME,
                  parseDateToMillis(start)
              )

              putExtra(
                  CalendarContract.EXTRA_EVENT_END_TIME,
                  parseDateToMillis(end)
              )

              addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
          }

          reactApplicationContext.startActivity(intent)
      } catch (e: Exception) {
          e.printStackTrace()
      }
  }

  fun parseDateToMillis(dateString: String): Long {
      return try {
          val format = SimpleDateFormat("yyyyMMdd'T'HHmmss'Z'", Locale.getDefault())
          format.timeZone = TimeZone.getTimeZone("UTC")
          val date = format.parse(dateString)
          date?.time ?: 0L
      } catch (e: Exception) {
          0L
      }
  }
}