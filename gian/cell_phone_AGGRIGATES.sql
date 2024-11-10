-- Customer Stat
SELECT
	CUSTOMER.phone		AS "Phone#",
	COUNT(CALL.id)		AS "Calls Placed",
	CASE
		WHEN COUNT(CALL.id) = MAX(COUNT(CALL.id)) OVER () 
		THEN
			TRUE
		ELSE
			FALSE
	END					AS "Top Caller(s)"
FROM CUSTOMER
JOIN CALL	ON CUSTOMER.phone = CALL.phone
GROUP BY CUSTOMER.phone
ORDER BY "Calls Placed" DESC;
