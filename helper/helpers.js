const addYears = (date, years) => {
  const newDate = new Date(date);
  const monthsToAdd = years * 12;
  newDate.setMonth(newDate.getMonth() + monthsToAdd);
  return newDate;
};

const generateOTP = (length) => {
  const characters = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return otp;
};

const generateUniqueOrderId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const dateString = `${year}${month}${day}`;

  const randomNumber = Math.floor(100000 + Math.random() * 900000);

  return `${dateString}-${randomNumber}`;
};

module.exports = { addYears, generateOTP, generateUniqueOrderId };
