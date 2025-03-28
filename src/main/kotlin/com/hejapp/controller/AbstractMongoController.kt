package com.hejapp.controller

import com.hejapp.ApplicationContext
import com.hejapp.exception.SessionExpiredException
import com.mongodb.client.MongoClient
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.util.StringUtils

abstract class AbstractMongoController(
    private val applicationContext: ApplicationContext,
) {
    fun getMongoClientFromContext(): MongoClient {
        val user = SecurityContextHolder.getContext().authentication.name
        val mongoClient = applicationContext.getMongoClient(user)
        if (mongoClient == null) {
            throw SessionExpiredException()
        } else {
            return mongoClient
        }
    }

    fun sanitizeQuery(query: String): String {
        var queryText = query.trim()
        if (StringUtils.hasText(queryText)) {
            if (!queryText.startsWith("{")) {
                queryText = "{$queryText"
            }
            if (!queryText.endsWith("}")) {
                queryText += "}"
            }
            queryText = sanitizeCurlyBraces(queryText)
        } else {
            queryText = "{}"
        }
        return queryText
    }

    private fun sanitizeCurlyBraces(query: String): String {
        var queryText = query
        var bracesCounter = 0
        for (i in queryText.indices) {
            if (queryText[i] == '{') {
                bracesCounter++
            } else if (queryText[i] == '}') {
                bracesCounter--
            }
        }
        if (bracesCounter > 0) {
            for (i in 1..bracesCounter) {
                queryText += "}"
            }
        }
        return queryText
    }
}