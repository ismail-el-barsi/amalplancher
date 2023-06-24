import bcrypt from "bcryptjs";

const data = {
  users: [
    {
      name: "ismail",
      email: "ismail@gmail.com",
      password: bcrypt.hashSync("teste"),
      isAdmin: true,
      isConducteur: false,
    },
    {
      name: "nouha",
      email: "nouha@gmail.com",
      password: bcrypt.hashSync("teste"),
      isAdmin: false,
      isConducteur: false,
    },
  ],
  employees: [
    {
      fullName: "John Doe",
      image: "/images/employe.jpg",
      cin: "A123456",
      email: "johndoe@example.com",
      phoneNumber: "+1 123-456-7890",
      type: "Full-time",
      salary: 5000,
    },
  ],

  products: [
    {
      name: "Red Bricks",
      slug: "red-bricks",
      category: "Bricks",
      image: "/images/bricks.jpg",
      price: 50,
      countInStock: 50,
      brand: "Amal Plancher Bricks",
      rating: 0,
      numReviews: 0,
      description:
        "High-quality red bricks for construction purposes. These bricks are durable and provide excellent strength for your building projects.",
      types: "",
      material: "Clay",
      reviews: [],
    },
    {
      name: "Cement",
      slug: "cement",
      category: "Cement",
      image: "/images/cement.jpg",
      price: 400,
      countInStock: 50,
      brand: "Amal Plancher Cement",
      rating: 0,
      numReviews: 0,
      description:
        "Grade 53 cement suitable for various construction applications. This cement offers high compressive strength and ensures long-lasting durability.",
      types: "",
      material: "Limestone",
      reviews: [],
    },
  ],
};

export default data;
