# Event Platform

A comprehensive platform for developers to discover and manage events like hackathons, meetups, and conferences. This project is built with Next.js and MongoDB, providing a seamless experience for finding and organizing tech events.

## Features

- **Event Discovery:** Browse a wide range of developer-focused events.
- **Detailed Event Information:** View comprehensive details including agenda, venue, location, and organizer.
- **Dynamic Routing:** Unique and SEO-friendly URLs for each event using slugs.
- **Responsive Design:** Optimized for all devices using Tailwind CSS.
- **Backend API:** Robust API endpoints for event management.
- **Database Integration:** Scalable data storage with MongoDB and Mongoose.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Image Management:** [Cloudinary](https://cloudinary.com/) (inferred from dependencies)
- **Utilities:** `clsx`, `tailwind-merge`

## Getting Started

### Prerequisites

- Node.js installed
- MongoDB instance (local or Atlas)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/event-platform.git
    cd event-platform
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Set up environment variables:
    Create a `.env.local` file in the root directory and add your MongoDB connection string and other necessary keys:

    ```env
    MONGODB_URI=your_mongodb_connection_string
    # Add other environment variables here
    ```

4.  Run the development server:

    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components.
- `database/`: Mongoose models and database connection logic.
- `lib/`: Utility functions and actions.
- `public/`: Static assets.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.
