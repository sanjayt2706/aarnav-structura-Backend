import TeamModel from "../models/Team.js";
import ProjectModel from "../models/Project.js";
import ServiceModel from "../models/Service.js";
import logger from "./logger.js";

const DEFAULT_TEAM = [
  {
    name: "Er. Aarnav Gowda",
    role: "Principal Structural Engineer",
    designation: "M.Tech (Structures), MIE, Chartered Engineer",
    experience: "14+ Years in RCC & High-Rise Design",
    email: "aarnav.structura@gmail.com",
    phone: "+91 77603 76348",
    bio: "Specializes in IS 456 / IS 1893 seismic structural framing, post-tensioned slab systems, and government structural stability certifications across Karnataka.",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
    display_order: 1,
    is_active: true,
    active: true
  },
  {
    name: "Ar. Priya Kulkarni",
    role: "Lead Architect & Planner",
    designation: "B.Arch, Registered COA Architect",
    experience: "10+ Years in Sustainable & Vastu Architecture",
    email: "priya.arch@aarnavstructura.com",
    phone: "+91 87623 98728",
    bio: "Directs concept planning, 3D visualization, SUDA/BBMP sanction drawings, and contemporary tropical residential design.",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80",
    display_order: 2,
    is_active: true,
    active: true
  },
  {
    name: "Er. Karthik Hegde",
    role: "Head of Project Execution & Quality",
    designation: "B.E. (Civil), Senior Site Engineer",
    experience: "9+ Years in Turnkey Site Delivery",
    email: "karthik.execution@aarnavstructura.com",
    phone: "+91 77603 76348",
    bio: "Supervises on-site RCC batching, cube test verifications, contractor coordination, and milestone handover inspections.",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    display_order: 3,
    is_active: true,
    active: true
  },
  {
    name: "Er. Manjunath Shetty",
    role: "MEP & Infrastructure Lead",
    designation: "B.Tech (Electrical & MEP Engineering)",
    experience: "8+ Years in Commercial MEP & Automation",
    email: "manjunath.mep@aarnavstructura.com",
    phone: "+91 87623 98728",
    bio: "Leads electrical load calculations, plumbing conduits, fire protection layouts, and solar grid installations.",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
    display_order: 4,
    is_active: true,
    active: true
  }
];

const DEFAULT_PROJECTS = [
  {
    title: "Sahyadri Contemporary Villa",
    category: "Residential Architecture",
    location: "Shivamogga, Karnataka",
    area_sqft: "4,200",
    cover_image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80",
    description: "Contemporary 4,200 sq.ft residential home constructed with IS 456 RCC framing, teakwood louvers, double-height living spaces, and rainwater harvesting.",
    brief: "Contemporary 4,200 sq.ft residential home constructed with IS 456 RCC framing, teakwood louvers, double-height living spaces, and rainwater harvesting.",
    status: "published"
  },
  {
    title: "Malnad Commercial Complex",
    category: "Commercial Infrastructure",
    location: "Shivamogga, Karnataka",
    area_sqft: "12,500",
    cover_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=80",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=80",
    description: "G+4 commercial showroom and corporate office complex featuring post-tensioned beam design and high-span column layouts.",
    brief: "G+4 commercial showroom and corporate office complex featuring post-tensioned beam design and high-span column layouts.",
    status: "published"
  },
  {
    title: "Heritage Green Duplex",
    category: "Turnkey Residential",
    location: "Shivamogga, Karnataka",
    area_sqft: "2,850",
    cover_image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80",
    description: "Turnkey duplex home featuring Vastu-compliant layout, modular kitchen, solar rooftop integration, and landscaped terrace.",
    brief: "Turnkey duplex home featuring Vastu-compliant layout, modular kitchen, solar rooftop integration, and landscaped terrace.",
    status: "published"
  }
];

const DEFAULT_SERVICES = [
  {
    title: "Architectural Planning & 3D Design",
    description: "Custom floor plans, elevation designs, SUDA/BBMP sanction drawings, and 3D walkthrough renderings.",
    icon: "📐",
    status: "Published",
    order: 1
  },
  {
    title: "Structural Engineering & RCC Detailing",
    description: "IS 456 / IS 1893 seismic framing design, slab calculations, beam reinforcement schedules, and structural audit certificates.",
    icon: "🏗️",
    status: "Published",
    order: 2
  },
  {
    title: "Turnkey Construction & Execution",
    description: "Complete end-to-end residential and commercial construction from excavation to key handover with milestone BOQ tracking.",
    icon: "🔑",
    status: "Published",
    order: 3
  },
  {
    title: "Project Management & BOQ Estimation",
    description: "Material quality inspection, site supervision, cube testing, itemized BOQ estimation, and stage-wise progress reporting.",
    icon: "📋",
    status: "Published",
    order: 4
  }
];

export async function seedInitialData() {
  try {
    const teamCount = await TeamModel.countDocuments();
    if (teamCount === 0) {
      await TeamModel.insertMany(DEFAULT_TEAM);
      logger.info("✅ Initial Team members seeded into MongoDB");
    }

    const projectCount = await ProjectModel.countDocuments();
    if (projectCount === 0) {
      await ProjectModel.insertMany(DEFAULT_PROJECTS);
      logger.info("✅ Initial Projects seeded into MongoDB");
    }

    const serviceCount = await ServiceModel.countDocuments();
    if (serviceCount === 0) {
      await ServiceModel.insertMany(DEFAULT_SERVICES);
      logger.info("✅ Initial Services seeded into MongoDB");
    }
  } catch (err) {
    logger.error("Error seeding initial data:", err.message);
  }
}
