-- Customer Stat
SELECT
	CUSTOMER.phone		AS "Phone#",
	COUNT(CALL.id)		AS "Calls Placed",
	CASE
		-- `OVER ()` Analyzes/calculates values across a set of rows related to the current row.
		WHEN COUNT(CALL.id) = MAX(COUNT(CALL.id)) OVER () 
		THEN
			TRUE
		ELSE
			FALSE
	END					AS "Top Caller(s)"
FROM CUSTOMER
JOIN CALL	ON CUSTOMER.phone = CALL.phone
GROUP BY "Phone#"
ORDER BY "Calls Placed" DESC;
