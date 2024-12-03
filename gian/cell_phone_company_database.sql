---------- FUNCTION ----------------------------------------------
DROP FUNCTION IF EXISTS calculate_elapsed(TIMESTAMP,TIMESTAMP);
DROP FUNCTION IF EXISTS calculate_call_cost(INT,INT);
DROP FUNCTION IF EXISTS calculate_usage_cost(INT,INT);
DROP FUNCTION IF EXISTS calculate_total_cost(INT,INT,INT);

CREATE FUNCTION calculate_elapsed(time_start TIMESTAMP, time_end TIMESTAMP) RETURNS INT AS $$
-- For use by calculate_call_cost(INT) function.
-- Calculates the elapsed time in minutes.
	DECLARE
	    elapsed INT := 0
	BEGIN
	    IF time_start IS NOT NULL AND time_end IS NOT NULL THEN
	       elapsed	INT	:= EXTRACT(EPOCH FROM (time_end::TIMESTAMP - time_start::TIMESTAMP)) / 60;
	    END IF;
		RETURN elapsed;
	END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION calculate_call_cost(elapsed INT, plan_id INT) RETURNS DECIMAL(15,2) AS $$
-- For use by calculate_total_cost(INT,INT) function.
-- Calculates the cost of a call based off of the customer's selected plan.
/*
If		(elapsed < c_limit):
	call_cost = elapsed * c_rate;
Else:
	call_cost = (c_limit * c_rate) + (elapsed - c_limit) * c_over_rate;
*/
	DECLARE
		c_rate		DECIMAL(5,2)	:= (SELECT c_rate		FROM PLAN_OPTION WHERE option = (SELECT option FROM PLAN WHERE id = plan_id));
		c_over_rate	DECIMAL(5,2)	:= (SELECT c_over_rate	FROM PLAN_OPTION WHERE option = (SELECT option FROM PLAN WHERE id = plan_id));
		c_limit		INT				:= (SELECT c_limit		FROM PLAN_OPTION WHERE option = (SELECT option FROM PLAN WHERE id = plan_id));
		call_cost	DECIMAL(15,2)	:= 0;
	BEGIN
		IF		(elapsed < c_limit)	THEN
			call_cost := elapsed * c_rate;
		ELSE
			call_cost := (c_limit * c_rate) + (elapsed - c_limit) * c_over_rate;
		END IF;
		RETURN call_cost;
	END;
$$ LANGUAGE plpgsql;

-- Create calculate_usage_cost(INT)
CREATE FUNCTION calculate_usage_cost(used INT, plan_id INT) RETURNS DECIMAL(15,2) AS $$
-- For use by calculate_total_cost(INT,INT) function.
-- Calculates the usage based off of the customer's selected plan.
/*
If		(usage < u_limit):
	usage_cost = usage * u_rate;
Else:
	usage_cost = (u_limit * u_rate) + (usage - u_limit) * u_over_rate;
*/
	DECLARE
		u_rate		DECIMAL(5,2)	:= (SELECT u_rate		FROM PLAN_OPTION WHERE option = (SELECT option FROM PLAN WHERE id = plan_id));
		u_over_rate	DECIMAL(5,2)	:= (SELECT u_over_rate	FROM PLAN_OPTION WHERE option = (SELECT option FROM PLAN WHERE id = plan_id));
		u_limit		INT				:= (SELECT u_limit		FROM PLAN_OPTION WHERE option = (SELECT option FROM PLAN WHERE id = plan_id));
		usage_cost	DECIMAL(15,2)	:= 0;
	BEGIN
		IF		(used < u_limit)	THEN
			usage_cost := used * u_rate;
		ELSE
			usage_cost := (u_limit * u_rate) + (used - u_limit) * u_over_rate;
		END IF;
		RETURN usage_cost;
	END;
$$ LANGUAGE plpgsql;

-- Create calculate_total_cost(INT)
CREATE FUNCTION calculate_total_cost(elapsed INT, used INT, plan_id INT) RETURNS DECIMAL(15,2) AS $$
-- For use by BILL relation for attribute BILL.cost.
-- Calculates the cost of the call and usage.
	DECLARE
		tax_rate	DECIMAL(5,2)	:= 0.0925;
		call_cost	DECIMAL(15,2)	:= calculate_call_cost(elapsed,plan_id);
		usage_cost	DECIMAL(15,2)	:= calculate_usage_cost(used,plan_id);
		total_cost	DECIMAL(15,2)	:= (call_cost + usage_cost) + ((call_cost + usage_cost) * tax_rate);
	BEGIN
		RETURN total_cost;
	END;
$$ LANGUAGE plpgsql;

---------- TABLES ------------------------------------------------
DROP TABLE IF EXISTS CUSTOMER		CASCADE;
DROP TABLE IF EXISTS PLAN_OPTION	CASCADE;
DROP TABLE IF EXISTS CARD			CASCADE;
DROP TABLE IF EXISTS CALL			CASCADE;
DROP TABLE IF EXISTS USAGE			CASCADE;
DROP TABLE IF EXISTS PLAN			CASCADE;
DROP TABLE IF EXISTS BILL			CASCADE;
DROP TABLE IF EXISTS PAYMENT_HIST	CASCADE;

/* LV1 */
CREATE TABLE PLAN_OPTION(
	Option		INT,			CONSTRAINT PLAN_OPTION_pk	PRIMARY KEY (Option),	CONSTRAINT PLAN_OPTION_uq	UNIQUE (Option),
	C_rate		DECIMAL(5,2),
	C_over_rate	DECIMAL(5,2),
	C_limit		INT,
	U_rate		DECIMAL(5,2),
	U_over_rate	DECIMAL(5,2),
	U_limit		INT
);

/* LV2 */
CREATE TABLE PLAN(
	ID			INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	Option		INT,	CONSTRAINT PLAN_OPTION_fk	FOREIGN KEY (Option) REFERENCES PLAN_OPTION(Option),
	Signup_date	DATE
);

/* LV3 */
CREATE TABLE CUSTOMER(
	Phone		VARCHAR(20),	CONSTRAINT CUSTOMER_pk	PRIMARY KEY (Phone),	CONSTRAINT CUSTOMER_uq UNIQUE (Phone),
	First_name	VARCHAR(100),
	Last_name	VARCHAR(100),
	Dob			DATE,
	Address		VARCHAR(50),
	Plan_ID		INT,			CONSTRAINT PLAN_fk		FOREIGN KEY (Plan_ID) REFERENCES PLAN(ID),
	Enroll_date	DATE
);

CREATE TABLE BILL(
	Plan_ID				INT,			CONSTRAINT PLAN_fk				FOREIGN KEY (Plan_ID) REFERENCES PLAN(ID),
	Start_date			DATE,			CONSTRAINT BILL_composite_pk	PRIMARY KEY (Plan_ID,Start_date),
	End_date			DATE, /* Violates 2NF but is very useful for bill calculation purposes */
	Total				DECIMAL(15,2) DEFAULT 0,
	Payment				DECIMAL(15,2) DEFAULT 0,
	remaining_balance	DECIMAL(15, 2) DEFAULT 0
);

/* LV4 */
CREATE TABLE CARD(
	ID		INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	Phone	VARCHAR(20),	CONSTRAINT CUSTOMER_fk	FOREIGN KEY (Phone) REFERENCES CUSTOMER(Phone),
	Balance	DECIMAL(15,2) DEFAULT 0
);

CREATE TABLE CALL(
	Phone		VARCHAR(20),	CONSTRAINT CUSTOMER_fk			FOREIGN KEY (Phone) REFERENCES CUSTOMER(Phone),
	Start_time	TIMESTAMP,		CONSTRAINT CALL_composite_pk	PRIMARY KEY (Phone,Start_time),
	End_time	TIMESTAMP,
    Billed      BOOL DEFAULT false
);

CREATE TABLE USAGE(
	Phone		VARCHAR(20),	CONSTRAINT CUSTOMER_fk			FOREIGN KEY (Phone) REFERENCES CUSTOMER(Phone),
	Date_rec	DATE,			CONSTRAINT USAGE_composite_pk	PRIMARY KEY (Phone,Date_rec),
	Used		INT,
    Billed      BOOL DEFAULT false
);

/* LV5 */
CREATE TABLE PAYMENT_HIST(
	Card_id		INT,			CONSTRAINT CARD_fk						FOREIGN KEY (Card_id) REFERENCES CARD(ID),
	Date_rec	DATE,			CONSTRAINT PAYMENT_HIST_composite_pk	PRIMARY KEY (Card_id,Date_rec),
	Amount		DECIMAL(15,2)
);

-- Indexes
CREATE INDEX idx_call_phone ON CALL(Phone);
CREATE INDEX idx_usage_phone ON USAGE(Phone);
CREATE INDEX idx_bill_plan_id ON BILL(Plan_ID);
CREATE INDEX idx_payment_hist_card_id ON PAYMENT_HIST(Card_id);

---------- PLAN OPTION ------------------------------------------
INSERT INTO PLAN_OPTION VALUES
	(1,0.50,0.55,180,0.50,0.55,254),
	(2,0.55,0.75,150,0.25,0.30,508),
	(3,0.25,0.30,200,0.55,0.75,152);
