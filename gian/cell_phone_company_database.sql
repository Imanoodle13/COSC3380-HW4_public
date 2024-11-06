DROP TABLE IF EXISTS customer		CASCADE;
DROP TABLE IF EXISTS plan_option	CASCADE;
DROP TABLE IF EXISTS call			CASCADE;
DROP TABLE IF EXISTS plan			CASCADE;
DROP TABLE IF EXISTS bank_info		CASCADE;
DROP TABLE IF EXISTS usage			CASCADE;
DROP TABLE IF EXISTS billing		CASCADE;
DROP TABLE IF EXISTS payment		CASCADE;

/*LV1*/
CREATE TABLE customer(
  id			INT PRIMARY KEY,
  first_name	VARCHAR(100),
  last_name		VARCHAR(100),
  dob			DATE,
  address		VARCHAR(50)
);

CREATE TABLE plan_option(
  id		INT PRIMARY KEY,
  name		VARCHAR(25),
  discount	DECIMAL(5,2)
);

/*LV2*/
CREATE TABLE call(
  id		INT PRIMARY KEY,
  cust_id	INT,
  CONSTRAINT customer_fk FOREIGN KEY (cust_id) references customer(id)
);

CREATE TABLE plan(
  cust_id	INT UNIQUE,
  plan_id	INT,
  CONSTRAINT customer_fk FOREIGN KEY (cust_id) REFERENCES customer(id),
  CONSTRAINT plan_option_fk FOREIGN KEY (plan_id) REFERENCES plan_option(id)
);

CREATE TABLE bank_info(
  cust_id	INT,
  card_id	INT UNIQUE,
  balance	DECIMAL(15,2),
  CONSTRAINT customer_fk FOREIGN KEY (cust_id) REFERENCES customer(id)
);

/* LV3 */
CREATE TABLE usage(
  id			INT PRIMARY KEY,
  call_id		INT UNIQUE,
  start_time	TIMESTAMP,
  end_time		TIMESTAMP,
  elapsed		INT,
  CONSTRAINT call_fk FOREIGN KEY (call_id) REFERENCES call(id)
);

/* LV4 */
CREATE TABLE billing(
  id		INT PRIMARY KEY,
  usage_id	INT UNIQUE,
  plan_id	INT,
  tax		DECIMAL(5,2),
  cost		DECIMAL(15,2),
  CONSTRAINT usage_fk FOREIGN KEY (usage_id) REFERENCES usage(id),
  CONSTRAINT plan_option_fk FOREIGN KEY (plan_id) REFERENCES plan_option(id)
);

/* LV5 */
CREATE TABLE payment(
  id		INT PRIMARY KEY,
  cust_id	INT,
  card_id	INT,
  bill_id	INT UNIQUE,
  paid		DECIMAL(15,2),
  CONSTRAINT customer_fk FOREIGN KEY (cust_id) REFERENCES customer(id),
  CONSTRAINT bank_info_fk FOREIGN KEY (card_id) REFERENCES bank_info(card_id),
  CONSTRAINT billing_fk FOREIGN KEY (bill_id) REFERENCES billing(id)
);

