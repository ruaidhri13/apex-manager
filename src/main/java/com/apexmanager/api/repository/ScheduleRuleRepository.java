package com.apexmanager.api.repository;

import com.apexmanager.api.model.ScheduleRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScheduleRuleRepository extends JpaRepository<ScheduleRule, Long> {
    List<ScheduleRule> findByDayOfWeek(String dayOfWeek);
}