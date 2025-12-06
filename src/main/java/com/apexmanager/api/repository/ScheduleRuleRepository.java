package com.apexmanager.api.repository;

import com.apexmanager.api.model.ScheduleRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScheduleRuleRepository extends JpaRepository<ScheduleRule, Long> {
    // Custom query: Spring automatically figures out the SQL for this!
    List<ScheduleRule> findByDayOfWeek(String dayOfWeek);
}